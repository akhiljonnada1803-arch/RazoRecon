from __future__ import annotations

import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("groq_service")


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
        Generate conversational shopping advice grounded in catalog products,
        spec comparisons, and AutoPay guardrails. Returns None on failure for fallback.
        """
        if not self.is_configured():
            return None

        active_key = self._get_active_key()
        model_name = self._get_active_model()

        # Build product context grounding
        prod_summaries = []
        for idx, p in enumerate(products[:3], 1):
            name = getattr(p, "name", "") or p.get("name", "")
            price = getattr(p, "price", 0.0) or p.get("price", 0.0)
            rating = getattr(p, "rating", 4.5) or p.get("rating", 4.5)
            features = getattr(p, "features", []) or p.get("features", [])
            pros = getattr(p, "pros", []) or p.get("pros", [])
            cons = getattr(p, "cons", []) or p.get("cons", [])
            delivery = getattr(p, "delivery_eta", "1-2 business days") or p.get("delivery_eta", "")
            brand = getattr(p, "brand", "Razorpay") or p.get("brand", "")

            feat_str = ", ".join(features[:3]) if features else "Commercial grade hardware"
            pros_str = "; ".join(pros[:2]) if pros else "High merchant satisfaction"
            cons_str = "; ".join(cons[:2]) if cons else "Standard enterprise maintenance"

            prod_summaries.append(
                f"[{idx}] {name} (Brand: {brand})\n"
                f"    - Price: ₹{price:,.2f} (Includes 18% GST)\n"
                f"    - Rating: {rating} ★\n"
                f"    - Key Features: {feat_str}\n"
                f"    - Pros: {pros_str}\n"
                f"    - Cons/Tradeoffs: {cons_str}\n"
                f"    - Delivery: {delivery}"
            )

        products_text = "\n\n".join(prod_summaries) if prod_summaries else "No direct catalog match."

        # AutoPay guardrails context
        guard_text = "AutoPay Status: Not configured."
        if guardrails:
            enabled = guardrails.get("autopay_enabled", False)
            budget = guardrails.get("monthly_budget", 0.0)
            rem = guardrails.get("remaining_budget", 0.0)
            single = guardrails.get("single_limit", 0.0)
            pm = guardrails.get("payment_method", "None")
            guard_text = (
                f"AutoPay Active: {enabled} | Connected Mandate: {pm} | "
                f"Single Buy Limit: ₹{single:,.2f} | Remaining Monthly Budget: ₹{rem:,.2f} (of ₹{budget:,.2f})"
            )

        system_prompt = (
            "You are the RazorCommerce AI Personal Shopping Advisor, an expert e-commerce and commercial hardware procurement assistant.\n\n"
            "YOUR OBJECTIVES:\n"
            "1. Answer the shopper's question in a professional, warm, concise, and helpful tone.\n"
            "2. Ground your advice strictly on the verified catalog items provided below.\n"
            "3. State why the #1 recommendation is the top pick for their stated need.\n"
            "4. Transparently highlight key advantages (pros) and honest tradeoffs (cons).\n"
            "5. Mention transparent GST-inclusive pricing (₹ INR).\n"
            "6. If AutoPay is active and within limits, let the user know they can purchase with 1-click AutoPay.\n"
            "7. Keep formatting clean with GitHub Markdown, bullet points, and appropriate emojis.\n"
            "8. Do not hallucinate products outside the catalog.\n\n"
            f"VERIFIED CATALOG CANDIDATES:\n{products_text}\n\n"
            f"CUSTOMER AUTOPAY GUARDRAILS:\n{guard_text}"
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Add recent conversation turns
        for item in history[-4:]:
            role = "user" if getattr(item, "role", "") == "user" or (isinstance(item, dict) and item.get("role") == "user") else "assistant"
            content = getattr(item, "content", "") if not isinstance(item, dict) else item.get("content", "")
            if content and isinstance(content, str):
                messages.append({"role": role, "content": content[:400]})

        messages.append({"role": "user", "content": query})

        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.4,
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
                            return content.strip()
                else:
                    logger.warning(f"Groq API returned status {resp.status_code}: {resp.text[:200]}")
                    return None
        except Exception as exc:
            logger.warning(f"Groq API request failed ({type(exc).__name__}): {str(exc)}")
            return None

        return None


groq_service = GroqService()
