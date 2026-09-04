from __future__ import annotations

import sys
import os
import csv
from typing import List, Dict, Optional

# Ensure src/ is on python path to reuse verified business logic
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from categorize import build_memory_from_golden, categorize_one, load_bank_feed
from policy_rag import KnowledgeBaseIndex
from schema import income_statement_section
from app.schemas.categorization import CategorizedTransactionDTO, CategorizationResponseDTO, PolicyBasisDTO

class CategorizationService:
    _memory = None
    _kb = None
    _override_cache: Dict[str, str] = {}
    _cached_result: CategorizationResponseDTO | None = None

    @classmethod
    def get_kb(cls) -> KnowledgeBaseIndex:
        if cls._kb is None:
            cls._kb = KnowledgeBaseIndex()
        return cls._kb

    @classmethod
    def get_memory(cls):
        if cls._memory is None:
            cls._memory = build_memory_from_golden(holdout_ids=set())
        return cls._memory

    def _parse_amount(self, s: str) -> float:
        return float(s.replace("₹", "").replace("Rs.", "").replace("Rs", "").replace(",", "").replace("$", "")) if s else 0.0

    async def get_all_categorized(self, auto_approve_threshold: float = 0.75, force_refresh: bool = False) -> CategorizationResponseDTO:
        if self._cached_result is not None and not force_refresh and not self._override_cache:
            return self._cached_result

        feed = load_bank_feed()
        memory = self.get_memory()
        kb = self.get_kb()

        items: List[CategorizedTransactionDTO] = []
        auto_post_count = 0

        for r in feed:
            txn_id = r["txn_id"]
            amount = self._parse_amount(r["amount"])

            # Check for human overrides
            if txn_id in self._override_cache:
                category = self._override_cache[txn_id]
                confidence = 1.0
                section = income_statement_section(category)
                auto_post = True
                cited_rule = "Manual Reviewer Approval"
                rationale = "Overridden and approved by financial reviewer."
                pb_dto = None
            else:
                res = categorize_one(r["description"], memory=memory, kb=kb)
                category = res["category"]
                confidence = round(float(res["confidence"]), 2)
                section = income_statement_section(category)
                auto_post = confidence >= auto_approve_threshold and category != "Needs Review"
                pb = res.get("policy_basis")
                cited_rule = f"{pb['doc_id']}: {pb['title']}" if pb else "—"
                rationale = res["rationale"]
                pb_dto = PolicyBasisDTO(doc_id=pb["doc_id"], title=pb["title"], score=pb.get("score")) if pb else None

            if auto_post:
                auto_post_count += 1

            items.append(
                CategorizedTransactionDTO(
                    txn_id=txn_id,
                    date=r["date"],
                    description=r["description"],
                    amount=amount,
                    category=category,
                    confidence=confidence,
                    section=section,
                    auto_post=auto_post,
                    cited_rule=cited_rule,
                    rationale=rationale,
                    policy_basis=pb_dto,
                )
            )

        total = len(items)
        rate = round(auto_post_count / total, 4) if total > 0 else 0.0
        review_count = total - auto_post_count

        res_dto = CategorizationResponseDTO(
            total_count=total,
            auto_post_count=auto_post_count,
            auto_post_rate=rate,
            review_count=review_count,
            items=items,
        )
        if not self._override_cache:
            CategorizationService._cached_result = res_dto
        return res_dto

    async def get_unapproved_transactions(self, auto_approve_threshold: float = 0.75) -> List[CategorizedTransactionDTO]:
        all_res = await self.get_all_categorized(auto_approve_threshold)
        return [item for item in all_res.items if not item.auto_post]

    async def override_category(self, txn_id: str, new_category: str) -> bool:
        feed = load_bank_feed()
        valid_ids = {r["txn_id"] for r in feed}
        if txn_id not in valid_ids:
            return False
        self._override_cache[txn_id] = new_category
        return True
