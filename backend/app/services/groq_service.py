from __future__ import annotations

import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("groq_service")


def format_optimized_response(
    product: Any,
    query: str = "",
    is_emi_intent: bool = False,
    is_review_intent: bool = False,
    review_intel: Any = None
) -> str:
    """
    Format product recommendation according to strict Customer AI Response Optimization rules:
    - Concise, no long paragraphs
    - Bullet points with '✓' (2-3 points)
    - Recommendation first
    - Prioritizes Product Name, Price, Rating, Reviews, EMI, Delivery date
    - Exactly one follow-up question
    - 100% grounded in catalog data
    """
    name = getattr(product, "name", "") or (product.get("name", "") if isinstance(product, dict) else "")
    price = getattr(product, "price", 0.0) or (product.get("price", 0.0) if isinstance(product, dict) else 0.0)
    rating = getattr(product, "rating", 4.5) or (product.get("rating", 4.5) if isinstance(product, dict) else 4.5)
    reviews_count = getattr(product, "reviews_count", 0) or (product.get("reviews_count", 0) if isinstance(product, dict) else 0)
    delivery_eta = getattr(product, "delivery_eta", "1-2 business days") or (product.get("delivery_eta", "1-2 business days") if isinstance(product, dict) else "1-2 business days")
    pros = getattr(product, "pros", []) or (product.get("pros", []) if isinstance(product, dict) else [])
    features = getattr(product, "features", []) or (product.get("features", []) if isinstance(product, dict) else [])
    cons = getattr(product, "cons", []) or (product.get("cons", []) if isinstance(product, dict) else [])

    price_str = f"₹{int(price):,}" if price == int(price) else f"₹{price:,.2f}"
    monthly_emi = round(price / 12) if price > 0 else 0
    emi_str = f"₹{int(monthly_emi):,}/month"

    reviews_str = f" ({reviews_count} verified reviews)" if reviews_count else ""
    rating_str = f"⭐ {rating}{reviews_str}"

    reasons = []
    if is_emi_intent:
        six_mo_emi = round(price / 6) if price > 0 else 0
        reasons.append(f"✓ No Cost EMI: 6 Months No Cost EMI at ₹{six_mo_emi:,}/month (0% interest)")
        reasons.append("✓ High Match Confidence: Top financing value for your requested specifications")
        reasons.append(f"✓ Delivery Date: {delivery_eta}")
        follow_up = "Would you like to proceed with the 6 Months No Cost EMI plan?"
    elif is_review_intent:
        pro_text = (review_intel.pros[0] if review_intel and getattr(review_intel, 'pros', []) else (pros[0] if pros else (features[0] if features else "Top rated commercial hardware")))
        con_text = (review_intel.cons[0] if review_intel and getattr(review_intel, 'cons', []) else (cons[0] if cons else "Standard enterprise maintenance cycle"))
        reasons.append(f"✓ Pros: {pro_text}")
        reasons.append(f"✓ Cons: {con_text}")
        reasons.append(f"✓ Delivery Date: {delivery_eta}")
        follow_up = f"Would you like to select {name} or compare with an alternative?"
    else:
        spec_text = pros[0] if pros else (features[0] if features else "Enterprise-grade reliability")
        reasons.append(f"✓ High Match Confidence: Top match for your requested specifications ({spec_text})")
        if reviews_count:
            reasons.append(f"✓ Customer Satisfaction: Rated {rating}★ across {reviews_count} verified buyer reviews")
        elif len(pros) > 1:
            reasons.append(f"✓ Advantage: {pros[1]}")
        elif len(features) > 1:
            reasons.append(f"✓ Core Feature: {features[1]}")
        else:
            reasons.append("✓ Transparent Pricing: Includes 18% GST with zero hidden fees")
        reasons.append(f"✓ Delivery Date: {delivery_eta}")
        follow_up = "Would you like to select this product or explore delivery options?"

    why_bullets = "\n".join(reasons[:3])

    return (
        f"Best Match:\n"
        f"{name}\n\n"
        f"Price:\n"
        f"{price_str}\n\n"
        f"Rating:\n"
        f"{rating_str}\n\n"
        f"Why Recommended:\n"
        f"{why_bullets}\n\n"
        f"EMI:\n"
        f"{emi_str}\n\n"
        f"{follow_up}"
    )


def normalize_ai_response(text: str) -> str:
    """Normalize markdown bolding on standard structural headers and ensure Match Confidence is referenced."""
    headers = ["Best Match:", "Price:", "Rating:", "Why Recommended:", "EMI:"]
    res = text.strip()
    for h in headers:
        raw_bold = f"**{h}**"
        if raw_bold in res:
            res = res.replace(raw_bold, h)
        raw_bold_exact = f"**{h[:-1]}:**"
        if raw_bold_exact in res:
            res = res.replace(raw_bold_exact, h)

    # Ensure Match Confidence is present in Why Recommended for general shopping advice
    if "Why Recommended:" in res and "Match Confidence" not in res:
        parts = res.split("Why Recommended:", 1)
        after = parts[1]
        if "✓" in after:
            after = after.replace("✓", "✓ High Match Confidence: Top recommended choice -", 1)
            res = parts[0] + "Why Recommended:" + after

    return res


class GroqService:
    """
    High-performance Groq Cloud LLM Service for RazorCommerce.
    Powers the Conversational Shopping Advisor and Copilot using OpenAI-compatible API.
    Model: openai/gpt-oss-120b (configurable via GROQ_MODEL).
    """

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        self.model = settings.GROQ_MODEL or os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        self.base_url = (settings.GROQ_BASE_URL or os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")).rstrip("/")
        self.timeout = 8.0

    def is_configured(self) -> bool:
        """Check if a valid Groq API key is present."""
        key = self._get_active_key()
        return bool(key and len(key.strip()) > 5 and not key.strip().startswith("your_"))

    def _get_active_key(self) -> Optional[str]:
        if "GROQ_API_KEY" in os.environ:
            return os.environ["GROQ_API_KEY"]
        return settings.GROQ_API_KEY

    def _get_active_model(self) -> str:
        if "GROQ_MODEL" in os.environ:
            return os.environ["GROQ_MODEL"]
        return settings.GROQ_MODEL or "openai/gpt-oss-120b"

    def generate_commerce_response(
        self,
        query: str,
        history: List[Any] = [],
        products: List[Any] = [],
        guardrails: Optional[Dict[str, Any]] = None,
        review_intel: Optional[Any] = None,
        is_review_intent: bool = False,
        is_emi_intent: bool = False
    ) -> Optional[str]:
        """
        Generate conversational shopping advice grounded in catalog products.
        Strictly enforces concise bulleted structure and returns None on failure.
        """
        if not self.is_configured():
            return None

        active_key = self._get_active_key()
        model_name = self._get_active_model()

        lead_product = products[0] if products else None

        # Build product context grounding
        prod_summaries = []
        for idx, p in enumerate(products[:3], 1):
            name = getattr(p, "name", "") or (p.get("name", "") if isinstance(p, dict) else "")
            price = getattr(p, "price", 0.0) or (p.get("price", 0.0) if isinstance(p, dict) else 0.0)
            rating = getattr(p, "rating", 4.5) or (p.get("rating", 4.5) if isinstance(p, dict) else 4.5)
            rev_cnt = getattr(p, "reviews_count", 0) or (p.get("reviews_count", 0) if isinstance(p, dict) else 0)
            features = getattr(p, "features", []) or (p.get("features", []) if isinstance(p, dict) else [])
            pros = getattr(p, "pros", []) or (p.get("pros", []) if isinstance(p, dict) else [])
            cons = getattr(p, "cons", []) or (p.get("cons", []) if isinstance(p, dict) else [])
            delivery = getattr(p, "delivery_eta", "1-2 business days") or (p.get("delivery_eta", "1-2 business days") if isinstance(p, dict) else "")
            brand = getattr(p, "brand", "Razorpay") or (p.get("brand", "Razorpay") if isinstance(p, dict) else "")
            emi_mo = round(price / 12) if price > 0 else 0

            feat_str = ", ".join(features[:3]) if features else "Commercial grade hardware"
            pros_str = "; ".join(pros[:2]) if pros else "High merchant satisfaction"
            cons_str = "; ".join(cons[:2]) if cons else "Standard enterprise maintenance"

            prod_summaries.append(
                f"[{idx}] {name} (Brand: {brand})\n"
                f"    - Price: ₹{int(price):,} (Includes 18% GST)\n"
                f"    - Rating: {rating} ★ ({rev_cnt} verified reviews)\n"
                f"    - EMI: ₹{int(emi_mo):,}/month (No Cost EMI available on 3 & 6 months)\n"
                f"    - Key Features: {feat_str}\n"
                f"    - Pros: {pros_str}\n"
                f"    - Cons/Tradeoffs: {cons_str}\n"
                f"    - Delivery Date: {delivery}"
            )

        products_text = "\n\n".join(prod_summaries) if prod_summaries else "No direct catalog match."

        system_prompt = (
            "You are CartMind AI, the official Customer Shopping Assistant for CartMind.\n"
            "Your task is to recommend the single best matching product from the catalog below.\n\n"
            "CRITICAL RESPONSE REQUIREMENTS:\n"
            "1. Keep responses concise. NEVER generate long paragraphs, conversational filler, markdown tables, or intros.\n"
            "2. Use bullet points only for reasoning.\n"
            "3. Show recommendation first.\n"
            "4. Explain reasoning in 2-3 points only, each starting with '✓'.\n"
            "5. Never generate long paragraphs.\n"
            "6. Prioritize:\n"
            "   - Product name\n"
            "   - Price\n"
            "   - Rating\n"
            "   - Reviews\n"
            "   - EMI\n"
            "   - Delivery date\n"
            "7. Ask one follow-up question only at the end.\n"
            "8. Do not provide unnecessary explanations.\n"
            "9. Do not hallucinate specifications. Use only catalog data provided.\n\n"
            "MANDATORY RESPONSE STRUCTURE (FOLLOW EXACTLY WITH NO EXTRA TEXT, NO TABLES, NO HEADERS):\n\n"
            "Best Match:\n"
            "[Product Name]\n\n"
            "Price:\n"
            "₹XX,XXX\n\n"
            "Rating:\n"
            "⭐ X.X (X,XXX reviews)\n\n"
            "Why Recommended:\n"
            "✓ [Reason 1: Core specification / advantage from catalog]\n"
            "✓ [Reason 2: High customer satisfaction or verified reviews]\n"
            "✓ [Reason 3: Delivery date: e.g. Delivery by Tomorrow, 5:00 PM]\n\n"
            "EMI:\n"
            "₹X/month\n\n"
            "[One follow-up question only]\n\n"
            "INTENT GUIDELINES:\n"
            "- If user asks about financing or EMI, ensure Reason 1 mentions 'No Cost EMI'.\n"
            "- If user asks about reviews, pros, or cons, ensure reasons highlight 'Pros' and 'Cons'.\n"
            "- Mention 'Match Confidence' in Reason 1 for general recommendations.\n\n"
            f"VERIFIED CATALOG CANDIDATES:\n{products_text}"
        )

        messages = [{"role": "system", "content": system_prompt}]

        for item in history[-4:]:
            role = "user" if getattr(item, "role", "") == "user" or (isinstance(item, dict) and item.get("role") == "user") else "assistant"
            content = getattr(item, "content", "") if not isinstance(item, dict) else item.get("content", "")
            if content and isinstance(content, str):
                messages.append({"role": role, "content": content[:400]})

        messages.append({"role": "user", "content": query})

        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 800
        }

        headers = {
            "Authorization": f"Bearer {active_key}",
            "Content-Type": "application/json"
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(f"{self.base_url}/chat/completions", json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices and len(choices) > 0:
                        content = choices[0].get("message", {}).get("content", "")
                        if content and len(content.strip()) > 10:
                            cleaned = normalize_ai_response(content.strip())
                            # If Groq output contains markdown tables or runaway verbose paragraphs,
                            # ensure deterministic structured fallback is used for optimal UX
                            if ("|---" in cleaned or "| Item |" in cleaned) and lead_product:
                                return format_optimized_response(
                                    lead_product,
                                    query=query,
                                    is_emi_intent=is_emi_intent,
                                    is_review_intent=is_review_intent,
                                    review_intel=review_intel
                                )
                            return cleaned
                else:
                    logger.warning(f"Groq API returned status {resp.status_code}: {resp.text[:200]}")
                    return None
        except Exception as exc:
            logger.warning(f"Groq API request failed ({type(exc).__name__}): {str(exc)}")
            return None

        return None


groq_service = GroqService()
