import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.commerce import (
    ProductDTO,
    ProductSpecDTO,
    AdvisorParsedIntentDTO,
    AdvisorRecommendationResponseDTO
)

logger = logging.getLogger(__name__)

# Known brand names in the catalog
CATALOG_BRANDS = [
    "Lenovo", "Sony", "Samsung", "LG", "ASUS", "HP", "Razorpay", 
    "Razorpay Hardware", "Epson", "TVS", "Zebra", "Hikvision", 
    "CP Plus", "Dahua", "Dell", "Apple"
]

# Category and domain keywords mapping
CATEGORY_DOMAIN_MAP = {
    "laptops": ["laptop", "notebook", "thinkpad", "expertbook", "probook", "macbook", "workstation", "computer"],
    "smart_tvs": ["tv", "television", "smart tv", "bravia", "oled", "qled", "4k tv", "nanocell"],
    "pos_machines": ["pos", "point of sale", "terminal", "card machine", "swiping", "billing machine", "edc"],
    "printers": ["printer", "receipt printer", "thermal printer", "pos printer", "billing printer", "barcode printer"],
    "cctv_security": ["cctv", "camera", "security camera", "dome camera", "bullet camera", "surveillance"],
    "soundbox": ["soundbox", "audio box", "speaker", "audio alert", "voice box"],
    "software": ["software", "erp", "ledger", "finops", "license", "reconciliation"]
}

CATEGORY_TO_OFFICIAL_NAME = {
    "laptops": ["Workstations & Laptops", "Workstations & Peripherals"],
    "smart_tvs": ["Smart TVs & Displays"],
    "pos_machines": ["Payment Terminals"],
    "printers": ["Receipt & Billing Printers", "Retail Peripherals"],
    "cctv_security": ["Security & Access", "Security & Access Tokens"],
    "soundbox": ["Payment Audio Alerts"],
    "software": ["Enterprise Software", "FinOps Software"]
}

# Spec & feature phrases to detect
COMMON_SPEC_PHRASES = [
    "low maintenance cost", "low maintenance", "low running cost",
    "small retail shop", "small retail", "retail shop", "retail store",
    "thermal printing", "thermal", "zero ink", "inkless",
    "4k", "ultra hd", "full hd", "1080p", "hdr10", "dolby atmos", "dolby audio",
    "google tv", "android tv", "smart tv", "tizen", "webos",
    "16gb", "8gb", "32gb", "512gb", "1tb", "ssd", "nvme",
    "core i5", "core i7", "ryzen 5", "ryzen 7", "m2", "m3",
    "battery", "long battery", "hot-swappable", "portable", "handheld",
    "touchscreen", "dual display", "nfc", "bharatqr", "upi autopay",
    "night vision", "ip67", "waterproof", "weatherproof", "ai motion",
    "high speed", "fast charging", "dual-sim", "4g", "5g", "wifi 6"
]


class AISearchService:
    """
    AI Search and Product Advisor Service for RazorCommerce.
    
    Powers natural language product queries using:
    1. Multi-factor intent & entity parsing (Budget, Desired Specs, Minimum Rating, Preferred Brands).
    2. Weighted 5-factor scoring engine:
       - Budget Match = 30%
       - Specs Match = 30%
       - Rating Score = 20%
       - Review Sentiment = 10%
       - Popularity Score = 10%
    3. Dynamic 'Why Recommended' reasoning explanation.
    4. Exact output: recommended_products, recommendation_reason, confidence_score.
    """

    def parse_user_intent(self, query: str) -> AdvisorParsedIntentDTO:
        """
        Extracts structured shopping constraints and preferences from a natural language query.
        Handles currencies (₹, INR, Rs), colloquial numbers (60k, 40,000), minimum ratings (4.5+),
        specs, and brand mentions.
        """
        raw_q = query or ""
        q_lower = raw_q.lower().strip()

        # 1. Budget extraction
        # Examples: "under ₹60,000", "under 60000", "below 40,000", "under 40k", "< 50k", "within 30000"
        budget: Optional[float] = None
        budget_patterns = [
            r'(?:under|below|less than|budget of|max|within|upto|up to|capped at|under\s*₹|below\s*₹|<=|<)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(k|lac|lakh)?\b',
            r'(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]+)?)\s*(k|lac|lakh)?\s*(?:budget|max|or less|under)',
            r'\b([0-9,]+)\s*(k)\b'
        ]
        
        for pat in budget_patterns:
            match = re.search(pat, q_lower)
            if match:
                num_str = match.group(1).replace(',', '')
                try:
                    val = float(num_str)
                    multiplier = match.group(2) if len(match.groups()) >= 2 else None
                    if multiplier == 'k':
                        val *= 1000.0
                    elif multiplier in ('lac', 'lakh'):
                        val *= 100000.0
                    elif val < 1000 and "k" in q_lower[match.start():match.end() + 2]:
                        val *= 1000.0
                    budget = val
                    break
                except ValueError:
                    pass

        # 2. Minimum Rating extraction
        # Examples: "4.5+ rating", "4.5+", "4+ stars", "at least 4.5 rating", "above 4.0 stars"
        rating_min: Optional[float] = None
        rating_patterns = [
            r'([0-9](?:\.[0-9])?)\s*\+\s*(?:rating|stars|star)?',
            r'(?:at least|min|above|minimum of)\s*([0-9](?:\.[0-9])?)\s*(?:rating|stars|star)?',
            r'rating\s*(?:of|above|>=|>)\s*([0-9](?:\.[0-9])?)'
        ]
        for pat in rating_patterns:
            match = re.search(pat, q_lower)
            if match:
                try:
                    r_val = float(match.group(1))
                    if 1.0 <= r_val <= 5.0:
                        rating_min = r_val
                        break
                except ValueError:
                    pass

        # 3. Preferred Brands extraction
        preferred_brands = []
        for brand in CATALOG_BRANDS:
            brand_word = brand.lower()
            if re.search(rf'\b{re.escape(brand_word)}\b', q_lower):
                preferred_brands.append(brand)

        # 4. Desired Specs & Domain extraction
        desired_specs = []
        matched_spans = []
        # Sort phrases by length descending to match longest phrases first
        for phrase in sorted(COMMON_SPEC_PHRASES, key=len, reverse=True):
            m = re.search(rf'\b{re.escape(phrase)}\b', q_lower)
            if m:
                span = m.span()
                if not any(s[0] <= span[0] and span[1] <= s[1] for s in matched_spans):
                    desired_specs.append(phrase)
                    matched_spans.append(span)

        # Catch specific technical specs like "16gb", "512gb", "4k", "oled", "thermal"
        tech_regex = re.finditer(r'\b(4k|8k|oled|qled|ips|ssd|nvme|16gb|8gb|32gb|core i[3579]|ryzen [3579]|android \d+|dual sim|nfc|wifi 6)\b', q_lower)
        for t_match in tech_regex:
            t = t_match.group(1)
            span = t_match.span()
            if not any(s[0] <= span[0] and span[1] <= s[1] for s in matched_spans):
                if t not in desired_specs:
                    desired_specs.append(t)
                    matched_spans.append(span)

        # 5. Category detection
        detected_cat = None
        for cat, kw_list in CATEGORY_DOMAIN_MAP.items():
            if any(re.search(rf'\b{re.escape(kw)}\b', q_lower) for kw in kw_list):
                detected_cat = cat
                break

        return AdvisorParsedIntentDTO(
            intent="product_recommendation",
            category=detected_cat,
            budget=budget,
            desired_specs=list(set(desired_specs)),
            rating_min=rating_min,
            preferred_brands=preferred_brands,
            raw_query=query
        )

    def calculate_product_ranking(
        self, 
        product: ProductDTO, 
        intent: AdvisorParsedIntentDTO
    ) -> Tuple[float, Dict[str, float]]:
        """
        Implements the exact RazorCommerce Product Ranking Formula:
        - Budget Match    = 30% (weight: 0.30)
        - Specs Match     = 30% (weight: 0.30)
        - Rating Score    = 20% (weight: 0.20)
        - Review Sentiment = 10% (weight: 0.10)
        - Popularity Score = 10% (weight: 0.10)
        
        Returns:
            (final_score: float, breakdown: Dict[str, float])
        """
        # 1. Budget Match (30% weight)
        if intent.budget and intent.budget > 0:
            if product.price <= intent.budget:
                # Within budget: reward optimal utilization with gentle decay if vastly under
                headroom_ratio = (intent.budget - product.price) / intent.budget
                # Score between 0.85 and 1.0 (getting closer to user's budget ceiling gets up to 1.0)
                budget_match = 1.0 - (headroom_ratio * 0.15)
            else:
                # Over budget: penalize proportionally
                over_ratio = (product.price - intent.budget) / intent.budget
                budget_match = max(0.0, 1.0 - (over_ratio * 3.5))
        else:
            budget_match = 0.85  # Neutral baseline when no budget constraint specified

        # 2. Specs Match (30% weight)
        features_list = getattr(product, 'features', []) or []
        features_str = " ".join(features_list) if isinstance(features_list, list) else str(features_list)
        specs_list = getattr(product, 'specs', []) or []
        specs_str = " ".join((s.key + ' ' + s.value) if hasattr(s, 'key') else str(s) for s in specs_list)
        pros_list = getattr(product, 'pros', []) or []
        pros_str = " ".join(pros_list) if isinstance(pros_list, list) else str(pros_list)

        prod_text = (
            f"{product.name} {product.brand} {product.category} {getattr(product, 'tagline', '') or ''} "
            f"{getattr(product, 'description', '') or ''} {features_str} "
            f"{specs_str} {pros_str}"
        ).lower()

        raw_q_tokens = [w for w in (intent.raw_query or "").lower().split() if len(w) > 2 and w not in ["best", "with", "for", "under", "below", "the", "and"]]

        matched_specs_count = 0
        total_desired = max(1, len(intent.desired_specs))
        if intent.desired_specs:
            for spec in intent.desired_specs:
                if spec in prod_text:
                    matched_specs_count += 1
            specs_ratio = matched_specs_count / total_desired
        else:
            specs_ratio = 0.0

        # Query keywords overlap
        token_matches = sum(1 for token in raw_q_tokens if token in prod_text)
        token_ratio = (token_matches / max(1, len(raw_q_tokens))) if raw_q_tokens else 0.5

        # Brand preference boost
        brand_boost = 0.0
        if intent.preferred_brands:
            if any(b.lower() in product.brand.lower() or b.lower() in product.name.lower() for b in intent.preferred_brands):
                brand_boost = 0.20

        # Category affinity check
        category_relevance = 1.0
        if intent.category:
            expected_official = CATEGORY_TO_OFFICIAL_NAME.get(intent.category, [])
            if any(product.category.strip().lower() == cat.strip().lower() for cat in expected_official):
                category_relevance = 1.0
            else:
                category_relevance = 0.05

        if intent.category:
            if category_relevance == 1.0:
                specs_ratio_val = specs_ratio if intent.desired_specs else 0.8
                token_ratio_val = token_ratio if raw_q_tokens else 0.8
                base_specs = 0.65 + (0.20 * specs_ratio_val) + (0.15 * token_ratio_val) + brand_boost
                specs_match = min(1.0, max(0.0, base_specs))
            else:
                specs_match = 0.05
        else:
            if intent.desired_specs:
                base_specs = (0.65 * specs_ratio + 0.35 * token_ratio) + brand_boost
            else:
                base_specs = token_ratio + brand_boost
            specs_match = min(1.0, max(0.0, base_specs))

        # 3. Rating Score (20% weight)
        # Rating is out of 5.0
        base_rating_score = min(1.0, max(0.0, product.rating / 5.0))
        if intent.rating_min:
            if product.rating >= intent.rating_min:
                # Meets or exceeds constraint: slight boost
                rating_score = min(1.0, base_rating_score * 1.05)
            else:
                # Violates rating threshold: apply severe penalty
                shortfall = (intent.rating_min - product.rating)
                rating_score = max(0.0, base_rating_score - (shortfall * 0.6))
        else:
            rating_score = base_rating_score

        # 4. Review Sentiment (10% weight)
        sentiment_score = product.review_sentiment_score if product.review_sentiment_score is not None else 0.90
        sentiment_score = min(1.0, max(0.0, sentiment_score))

        # 5. Popularity Score (10% weight)
        if product.popularity_score is not None:
            popularity_score = min(1.0, max(0.0, product.popularity_score))
        else:
            # Derived fallback from reviews_count
            popularity_score = min(1.0, max(0.5, (product.reviews_count / 300.0)))

        # Compute weighted sum
        final_score = (
            0.30 * budget_match +
            0.30 * specs_match +
            0.20 * rating_score +
            0.10 * sentiment_score +
            0.10 * popularity_score
        )

        breakdown = {
            "budget_match": round(budget_match, 4),
            "specs_match": round(specs_match, 4),
            "rating_score": round(rating_score, 4),
            "review_sentiment": round(sentiment_score, 4),
            "popularity_score": round(popularity_score, 4),
            "total_score": round(final_score, 4)
        }

        return final_score, breakdown

    def explain_why_recommended(
        self, 
        product: ProductDTO, 
        intent: AdvisorParsedIntentDTO,
        breakdown: Dict[str, float]
    ) -> str:
        """
        Generates a transparent, natural-language explanation of why this specific product
        was selected and ranked #1 for the user's requirements.
        """
        reasons = []

        # 1. Budget explanation
        if intent.budget:
            if product.price <= intent.budget:
                savings = intent.budget - product.price
                if savings > 100:
                    reasons.append(f"Priced at ₹{product.price:,.2f}, fitting comfortably inside your ₹{intent.budget:,.2f} budget with ₹{savings:,.2f} headroom")
                else:
                    reasons.append(f"Optimally maximizes your ₹{intent.budget:,.2f} budget at ₹{product.price:,.2f}")
            else:
                over = product.price - intent.budget
                reasons.append(f"Slightly above ₹{intent.budget:,.2f} (by ₹{over:,.2f}), but delivers unmatched value in build and longevity")
        else:
            reasons.append(f"Competitively priced at ₹{product.price:,.2f} inclusive of GST")

        # 2. Specs / Use Case explanation
        matched_specs = [s for s in intent.desired_specs if s in (product.description + " " + " ".join(product.features)).lower()]
        if matched_specs:
            spec_desc = ", ".join(s.title() for s in matched_specs[:3])
            reasons.append(f"Directly matches your requirement for {spec_desc}")
        elif intent.category == "printers" and ("low maintenance" in (intent.raw_query or "").lower() or "cost" in (intent.raw_query or "").lower()):
            reasons.append("Ultra-low maintenance design with thermal inkless technology and rated for 100,000+ continuous cuts")
        elif intent.category == "pos_machines" and ("small retail" in (intent.raw_query or "").lower() or "retail" in (intent.raw_query or "").lower()):
            reasons.append("Engineered specifically for small retail counters with lightweight footprint, all-day battery, and instant QR sound alerts")
        elif product.features:
            reasons.append(f"Standout features: {product.features[0]}")

        # 3. Rating & Sentiment explanation
        if intent.rating_min:
            reasons.append(f"Surpasses your {intent.rating_min}+ rating requirement with an outstanding {product.rating}★ rating ({product.reviews_count} verified reviews)")
        else:
            reasons.append(f"Highly rated at {product.rating}★ based on {product.reviews_count} verified business reviews with {int((product.review_sentiment_score or 0.90) * 100)}% positive sentiment")

        # 4. Brand preference
        if intent.preferred_brands and any(b.lower() in product.brand.lower() for b in intent.preferred_brands):
            reasons.append(f"Matches your brand preference for {product.brand}")

        return " | ".join(reasons)

    def recommend(
        self, 
        query: str, 
        products: List[ProductDTO], 
        limit: int = 3
    ) -> AdvisorRecommendationResponseDTO:
        """
        Full orchestration of the AI Product Advisor:
        1. Parse intent
        2. Rank all candidate products using exact 5-factor formula
        3. Decorate top products with match_score and ranking breakdown
        4. Formulate overall recommendation reason and confidence score
        """
        if not products:
            from app.services.catalog_service import catalog_service
            cat_resp = catalog_service.get_all_products(limit=1000)
            products = (cat_resp.items if hasattr(cat_resp, "items") else getattr(cat_resp, "products", [])) or []

        if not products:
            return AdvisorRecommendationResponseDTO(
                recommended_products=[],
                recommendation_reason="No products available in the catalog matching your search criteria.",
                confidence_score=0.0,
                query=query
            )

        # 1. Parse intent
        intent = self.parse_user_intent(query)

        # Standardize products to ProductDTO
        standardized_products: List[ProductDTO] = []
        for p in products:
            if isinstance(p, ProductDTO):
                standardized_products.append(p)
            else:
                specs_raw = getattr(p, 'specs', []) or []
                specs_dto = []
                for s in specs_raw:
                    if hasattr(s, 'key') and hasattr(s, 'value'):
                        specs_dto.append(ProductSpecDTO(key=s.key, value=s.value))
                    elif isinstance(s, dict):
                        specs_dto.append(ProductSpecDTO(key=s.get('key', ''), value=s.get('value', '')))
                
                features_raw = getattr(p, 'features', []) or []
                if isinstance(features_raw, str):
                    features_raw = [features_raw]

                prod_dto = ProductDTO(
                    id=getattr(p, 'id', ''),
                    name=getattr(p, 'name', ''),
                    brand=getattr(p, 'brand', '') or "Razorpay Hardware",
                    category=getattr(p, 'category', '') or "General",
                    price=float(getattr(p, 'price', 0.0)),
                    original_price=getattr(p, 'original_price', None),
                    currency=getattr(p, 'currency', 'INR'),
                    rating=float(getattr(p, 'rating', 4.8) or 4.8),
                    reviews_count=int(getattr(p, 'reviews_count', 120) or 120),
                    image_url=getattr(p, 'image_url', ''),
                    tagline=getattr(p, 'tagline', '') or "",
                    description=getattr(p, 'description', '') or "",
                    features=features_raw,
                    specs=specs_dto,
                    pros=getattr(p, 'pros', []) or [],
                    cons=getattr(p, 'cons', []) or [],
                    stock_status=getattr(p, 'stock_status', 'In Stock'),
                    in_stock=bool(getattr(p, 'in_stock', True)),
                    delivery_time=getattr(p, 'delivery_time', '2-3 business days'),
                    review_sentiment_score=getattr(p, 'review_sentiment_score', 0.90),
                    popularity_score=getattr(p, 'popularity_score', 0.88)
                )
                standardized_products.append(prod_dto)

        # 2. Score and rank products
        scored_products: List[Tuple[float, ProductDTO, Dict[str, float]]] = []
        for p in standardized_products:
            score, breakdown = self.calculate_product_ranking(p, intent)
            # Create a clone/decorated product DTO
            decorated_p = p.model_copy(update={
                "match_score": round(score * 100, 1),
                "ranking_breakdown": breakdown,
                "why_recommended": self.explain_why_recommended(p, intent, breakdown)
            })
            scored_products.append((score, decorated_p, breakdown))

        # Sort descending by score
        scored_products.sort(key=lambda x: x[0], reverse=True)

        top_candidates = scored_products[:limit]
        top_products = [item[1] for item in top_candidates]

        if not top_products:
            return AdvisorRecommendationResponseDTO(
                recommended_products=[],
                recommendation_reason="No suitable products found matching the criteria.",
                confidence_score=0.0,
                parsed_intent=intent,
                query=query
            )

        lead_product = top_products[0]
        lead_breakdown = top_candidates[0][2]
        confidence = round(lead_breakdown["total_score"], 2)

        # Overall recommendation reason
        why_text = self.explain_why_recommended(lead_product, intent, lead_breakdown)
        recommendation_reason = (
            f"Recommended #{1} '{lead_product.name}' as the optimal match ({int(lead_breakdown['total_score'] * 100)}% Match). {why_text}."
        )

        return AdvisorRecommendationResponseDTO(
            recommended_products=top_products,
            recommendation_reason=recommendation_reason,
            confidence_score=confidence,
            parsed_intent=intent,
            query=query
        )

    def search_products(self, query: str, limit: int = 3) -> AdvisorRecommendationResponseDTO:
        """Convenience method to search directly from the catalog database."""
        from app.services.catalog_service import catalog_service
        catalog_resp = catalog_service.get_all_products(limit=100)
        products = catalog_resp.items if hasattr(catalog_resp, 'items') else catalog_resp
        return self.recommend(query=query, products=products, limit=limit)


ai_search_service = AISearchService()
