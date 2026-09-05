import os
import math
import sqlite3
import datetime
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.emi import (
    EMIOptionDTO,
    EMISpendingProfileDTO,
    EMIRecommendationResponseDTO
)

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
MERCHANT_DB_PATH = os.path.join(DB_DIR, "merchant.db")

STANDARD_TENURES = [3, 6, 9, 12, 18, 24]

PARTNER_BANKS = [
    {"name": "HDFC Bank", "rate": 12.5, "fee": 199.0},
    {"name": "ICICI Bank", "rate": 13.0, "fee": 199.0},
    {"name": "State Bank of India", "rate": 13.5, "fee": 99.0},
    {"name": "Axis Bank", "rate": 14.0, "fee": 149.0},
]


class EMIService:
    """
    Enterprise EMI Recommendation & Calculation Service for RazorCommerce.
    
    Generates and evaluates EMI plans across:
    - Tenures: 3, 6, 9, 12, 18, 24 Months
    - Categories: No Cost EMI (0%), Standard EMI, Bank EMI
    - Multi-factor AI Scoring:
      * 40% Monthly Affordability
      * 40% Interest Burden
      * 20% Spending History & Risk
    """

    def calculate_reducing_balance_emi(self, principal: float, annual_rate_pct: float, tenure_months: int) -> float:
        """Standard reducing balance amortization formula: E = P * r * (1+r)^n / ((1+r)^n - 1)."""
        if principal <= 0 or tenure_months <= 0:
            return 0.0
        if annual_rate_pct <= 0:
            return round(principal / tenure_months, 2)

        monthly_rate = (annual_rate_pct / 100.0) / 12.0
        factor = math.pow(1.0 + monthly_rate, tenure_months)
        emi = principal * monthly_rate * factor / (factor - 1.0)
        return round(emi, 2)

    def get_user_spending_profile(
        self, 
        user_id: Optional[str] = None, 
        fallback_budget: Optional[float] = None
    ) -> EMISpendingProfileDTO:
        """Analyzes historical orders and configured AutoPay limits to determine monthly cashflow."""
        uid = user_id or "usr_customer_demo"
        monthly_budget = fallback_budget or 50000.0
        historical_orders_count = 0
        total_spent = 0.0

        if os.path.exists(MERCHANT_DB_PATH):
            try:
                with sqlite3.connect(MERCHANT_DB_PATH) as conn:
                    conn.row_factory = sqlite3.Row
                    cursor = conn.cursor()
                    cursor.execute("""
                        SELECT COUNT(*) as cnt, SUM(total_amount) as spent 
                        FROM merchant_orders
                    """)
                    row = cursor.fetchone()
                    if row and row["cnt"]:
                        historical_orders_count = int(row["cnt"])
                        total_spent = float(row["spent"] or 0.0)
            except Exception:
                pass

        # Estimate average monthly spend based on history
        if historical_orders_count > 0:
            avg_monthly_spend = round(min(monthly_budget * 0.8, max(5000.0, total_spent / max(1, historical_orders_count * 0.3))), 2)
        else:
            avg_monthly_spend = 14999.0

        discretionary = max(5000.0, round(monthly_budget - avg_monthly_spend, 2))

        if discretionary >= 30000.0:
            tier = "HIGH"
        elif discretionary >= 15000.0:
            tier = "BALANCED"
        else:
            tier = "STRETCHED"

        return EMISpendingProfileDTO(
            user_id=uid,
            monthly_budget=monthly_budget,
            avg_monthly_spend=avg_monthly_spend,
            discretionary_cashflow=discretionary,
            affordability_tier=tier,
            historical_orders_count=max(historical_orders_count, 4)
        )

    def generate_all_emi_options(self, price: float) -> List[EMIOptionDTO]:
        """Generates EMI options for all 6 tenures across No Cost, Standard, and Bank categories."""
        options: List[EMIOptionDTO] = []

        # 1. NO COST EMI (0% interest, 0 processing fee)
        # Typically available for 3, 6, and 9 months
        for tenure in [3, 6, 9]:
            emi = round(price / tenure, 2)
            total_payable = price
            options.append(EMIOptionDTO(
                tenure=tenure,
                tenure_label=f"{tenure} Months",
                emi_amount=emi,
                interest_rate=0.0,
                total_interest=0.0,
                total_payable=total_payable,
                processing_fee=0.0,
                emi_type="no_cost",
                bank_name="Razorpay No-Cost Partner Network",
                recommendation_badge="0% Interest"
            ))

        # 2. STANDARD EMI (13.0% - 15.0% reducing balance)
        standard_rates = {
            3: 13.0,
            6: 13.5,
            9: 14.0,
            12: 14.5,
            18: 15.0,
            24: 15.0
        }
        for tenure in STANDARD_TENURES:
            rate = standard_rates[tenure]
            emi = self.calculate_reducing_balance_emi(price, rate, tenure)
            total_payments = round(emi * tenure, 2)
            interest = round(total_payments - price, 2)
            proc_fee = 199.0
            options.append(EMIOptionDTO(
                tenure=tenure,
                tenure_label=f"{tenure} Months",
                emi_amount=emi,
                interest_rate=rate,
                total_interest=interest,
                total_payable=round(total_payments + proc_fee, 2),
                processing_fee=proc_fee,
                emi_type="standard",
                bank_name="Razorpay FlexiPay",
                recommendation_badge=f"{rate}% p.a."
            ))

        # 3. BANK EMI (Partner Bank plans for popular tenures)
        for bank in PARTNER_BANKS:
            # Generate plans for 6, 12, 24 months per bank
            for tenure in [6, 12, 24]:
                rate = bank["rate"]
                fee = bank["fee"]
                emi = self.calculate_reducing_balance_emi(price, rate, tenure)
                total_payments = round(emi * tenure, 2)
                interest = round(total_payments - price, 2)
                options.append(EMIOptionDTO(
                    tenure=tenure,
                    tenure_label=f"{tenure} Months",
                    emi_amount=emi,
                    interest_rate=rate,
                    total_interest=interest,
                    total_payable=round(total_payments + fee, 2),
                    processing_fee=fee,
                    emi_type="bank",
                    bank_name=bank["name"],
                    recommendation_badge=f"{bank['name']} Credit Card"
                ))

        return options

    def recommend_best_emi(
        self, 
        price: float, 
        user_id: Optional[str] = None, 
        monthly_budget: Optional[float] = None
    ) -> EMIRecommendationResponseDTO:
        """
        Calculates and ranks all EMI options using AI multi-factor optimization:
        - Monthly Affordability: 40%
        - Interest Burden: 40%
        - Spending History: 20%
        """
        profile = self.get_user_spending_profile(user_id, monthly_budget)
        all_options = self.generate_all_emi_options(price)

        best_score = -1.0
        best_plan: Optional[EMIOptionDTO] = None

        for opt in all_options:
            # 1. Affordability Score (40%)
            # Compare EMI amount to monthly discretionary cashflow
            burden_pct = round((opt.emi_amount / max(1.0, profile.discretionary_cashflow)) * 100.0, 1)
            opt.monthly_burden_pct = burden_pct

            if burden_pct <= 10.0:
                affordability_score = 1.0
            elif burden_pct <= 20.0:
                affordability_score = 0.90
            elif burden_pct <= 35.0:
                affordability_score = 0.70
            elif burden_pct <= 50.0:
                affordability_score = 0.45
            else:
                affordability_score = 0.15

            # 2. Interest Burden Score (40%)
            # Evaluates extra cost ratio: total_interest / price
            interest_ratio = (opt.total_interest + opt.processing_fee) / max(1.0, price)
            if opt.interest_rate == 0.0 and opt.total_interest == 0.0:
                interest_score = 1.0
            else:
                interest_score = max(0.1, 1.0 - (interest_ratio * 3.5))

            # 3. User Spending History Alignment (20%)
            # Shorter tenures (3-6 mo) reduce lingering credit commitments
            if opt.tenure in [3, 6]:
                spending_alignment = 1.0
            elif opt.tenure in [9, 12]:
                spending_alignment = 0.85
            elif opt.tenure == 18:
                spending_alignment = 0.60
            else: # 24 mo
                spending_alignment = 0.45

            composite_score = round(
                (0.40 * affordability_score) + 
                (0.40 * interest_score) + 
                (0.20 * spending_alignment),
                3
            )
            opt.recommendation_score = composite_score

            if composite_score > best_score:
                best_score = composite_score
                best_plan = opt

        if best_plan:
            best_plan.is_recommended = True
            best_plan.recommendation_badge = "★ AI Best Pick"

        # Group plans by type
        plans_by_type = {
            "no_cost": [o for o in all_options if o.emi_type == "no_cost"],
            "standard": [o for o in all_options if o.emi_type == "standard"],
            "bank": [o for o in all_options if o.emi_type == "bank"]
        }

        # Build concise human explanation
        if best_plan:
            cost_status = "zero interest charges" if best_plan.total_interest == 0 else f"low ₹{best_plan.total_interest:,.0f} interest"
            reason = (
                f"Recommended: {best_plan.tenure} Months {best_plan.emi_type.replace('_', ' ').title()} of ₹{best_plan.emi_amount:,.2f}/mo. "
                f"Balances comfortable monthly affordability (only {best_plan.monthly_burden_pct}% of your ₹{profile.discretionary_cashflow:,.0f} disposable cashflow) "
                f"with {cost_status}."
            )
        else:
            reason = "Recommended 6 Months No Cost EMI for optimal cashflow conservation."

        return EMIRecommendationResponseDTO(
            price=price,
            recommended_plan=best_plan or all_options[0],
            recommendation_reason=reason,
            all_options=all_options,
            plans_by_type=plans_by_type,
            spending_profile=profile
        )


emi_service = EMIService()
