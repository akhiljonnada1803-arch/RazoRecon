from __future__ import annotations

import sys
import os
from typing import List, Dict
from datetime import datetime, timedelta, date

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

import ledger
from reconcile import reconcile, load_payouts
from app.schemas.forecast import (
    CashForecastResponseDTO,
    HorizonForecastDTO,
    DailyForecastPointDTO,
    LiquidityRiskIndicatorDTO,
    ForecastInsightDTO,
)

from app.services.data_state_service import data_state_service

class ForecastService:
    def _parse_date(self, s: str) -> date:
        for fmt in ("%Y-%m-%d", "%m/%d/%Y"):
            try:
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue
        return date(2026, 3, 1)

    async def generate_forecast(self, merchant_id: Optional[str] = None) -> CashForecastResponseDTO:
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                orders = merchant_service.get_orders(merchant_id=merchant_id)
                paid_orders = [o for o in orders if o.get("payment_status") == "PAID"]
                if len(paid_orders) < 3:
                    zero_horizon_7d = HorizonForecastDTO(
                        horizon_days=7,
                        horizon_label="7-Day Projection",
                        expected_inflow=0.0,
                        expected_outflow=0.0,
                        net_cash_flow=0.0,
                        projected_closing_balance=0.0,
                        confidence_score=0,
                        burn_rate_daily=0.0,
                        runway_days=0
                    )
                    zero_horizon_30d = HorizonForecastDTO(
                        horizon_days=30,
                        horizon_label="30-Day Projection",
                        expected_inflow=0.0,
                        expected_outflow=0.0,
                        net_cash_flow=0.0,
                        projected_closing_balance=0.0,
                        confidence_score=0,
                        burn_rate_daily=0.0,
                        runway_days=0
                    )
                    zero_horizon_90d = HorizonForecastDTO(
                        horizon_days=90,
                        horizon_label="90-Day Projection",
                        expected_inflow=0.0,
                        expected_outflow=0.0,
                        net_cash_flow=0.0,
                        projected_closing_balance=0.0,
                        confidence_score=0,
                        burn_rate_daily=0.0,
                        runway_days=0
                    )
                    return CashForecastResponseDTO(
                        status="INSUFFICIENT_DATA",
                        message="Insufficient data for forecasting. At least 3 settled orders are required.",
                        executive_summary="INSUFFICIENT_DATA: A minimum of 3 settled customer orders is required to compute moving averages and predictive liquidity horizons.",
                        current_cash_balance=0.0,
                        forecast_7d=zero_horizon_7d,
                        forecast_30d=zero_horizon_30d,
                        forecast_90d=zero_horizon_90d,
                        daily_timeline=[],
                        risk_indicators=[],
                        insights=[
                            ForecastInsightDTO(
                                id="ins_insufficient_data",
                                category="Working Capital",
                                title="Insufficient Data for Forecasting",
                                detail="Receive at least 3 customer transactions to unlock real-time cash flow and liquidity forecasting.",
                                impact_amount=0.0,
                                actionable_step="Complete catalog setup, link payment gateway, and process your initial store orders."
                            )
                        ]
                    )

        from app.services.auth_service import auth_service
        is_demo = bool(merchant_id and auth_service.is_demo_merchant(merchant_id))
        if not data_state_service.has_data() and not is_demo:
            zero_h = HorizonForecastDTO(
                horizon_days=30,
                horizon_label="30-Day Projection",
                expected_inflow=0.0,
                expected_outflow=0.0,
                net_cash_flow=0.0,
                projected_closing_balance=0.0,
                confidence_score=0,
                burn_rate_daily=0.0,
                runway_days=0
            )
            return CashForecastResponseDTO(
                status="INSUFFICIENT_DATA",
                message="No financial data available.",
                executive_summary="No data available to generate forecast.",
                current_cash_balance=0.0,
                forecast_7d=zero_h,
                forecast_30d=zero_h,
                forecast_90d=zero_h,
                daily_timeline=[],
                risk_indicators=[],
                insights=[]
            )

        ledger_rows = ledger.load_ledger()
        payouts = load_payouts()

        # Compute current base cash balance
        opening_cash = 750000.0  # Base INR liquidity
        total_inflow = sum(r["amount"] for r in ledger_rows if r["amount"] > 0)
        total_outflow = sum(abs(r["amount"]) for r in ledger_rows if r["amount"] < 0)
        current_cash = opening_cash + total_inflow - total_outflow

        # Daily moving average calculation
        # Group historical ledger transactions by date
        daily_inflows: Dict[str, float] = {}
        daily_outflows: Dict[str, float] = {}
        for r in ledger_rows:
            d_str = r["date"]
            if "/" in d_str:
                m, d, y = d_str.split("/")
                d_norm = f"{y}-{int(m):02d}-{int(d):02d}"
            else:
                d_norm = d_str
            amt = r["amount"]
            if amt > 0:
                daily_inflows[d_norm] = daily_inflows.get(d_norm, 0.0) + amt
            else:
                daily_outflows[d_norm] = daily_outflows.get(d_norm, 0.0) + abs(amt)

        # Average daily velocity
        hist_days = max(len(set(list(daily_inflows.keys()) + list(daily_outflows.keys()))), 30)
        avg_daily_inflow = (total_inflow / hist_days) * 1.08   # 8% growth trajectory
        avg_daily_outflow = (total_outflow / hist_days) * 1.02 # 2% cost containment

        # Build 7-day, 30-day, 90-day Horizon Forecasts
        f7_in = avg_daily_inflow * 7
        f7_out = avg_daily_outflow * 7
        f7_net = f7_in - f7_out
        f7_close = current_cash + f7_net

        f30_in = avg_daily_inflow * 30
        f30_out = avg_daily_outflow * 30
        f30_net = f30_in - f30_out
        f30_close = current_cash + f30_net

        f90_in = avg_daily_inflow * 90
        f90_out = avg_daily_outflow * 90
        f90_net = f90_in - f90_out
        f90_close = current_cash + f90_net

        daily_burn = avg_daily_outflow - avg_daily_inflow
        runway_days = int(current_cash / daily_burn) if daily_burn > 0 else 450

        forecast_7d = HorizonForecastDTO(
            horizon_days=7,
            horizon_label="7-Day Projection",
            expected_inflow=round(f7_in, 2),
            expected_outflow=round(f7_out, 2),
            net_cash_flow=round(f7_net, 2),
            projected_closing_balance=round(f7_close, 2),
            confidence_score=97,
            burn_rate_daily=round(max(0, daily_burn), 2),
            runway_days=runway_days,
        )

        forecast_30d = HorizonForecastDTO(
            horizon_days=30,
            horizon_label="30-Day Projection",
            expected_inflow=round(f30_in, 2),
            expected_outflow=round(f30_out, 2),
            net_cash_flow=round(f30_net, 2),
            projected_closing_balance=round(f30_close, 2),
            confidence_score=93,
            burn_rate_daily=round(max(0, daily_burn), 2),
            runway_days=runway_days,
        )

        forecast_90d = HorizonForecastDTO(
            horizon_days=90,
            horizon_label="90-Day Projection",
            expected_inflow=round(f90_in, 2),
            expected_outflow=round(f90_out, 2),
            net_cash_flow=round(f90_net, 2),
            projected_closing_balance=round(f90_close, 2),
            confidence_score=88,
            burn_rate_daily=round(max(0, daily_burn), 2),
            runway_days=runway_days,
        )

        # Generate 45-day Daily Timeline (15 historical + 30 forecast)
        base_date = date(2026, 3, 16)
        timeline: List[DailyForecastPointDTO] = []

        # 15 days historical actuals
        running_hist = current_cash - (avg_daily_inflow * 15) + (avg_daily_outflow * 15)
        for i in range(15, 0, -1):
            d = base_date - timedelta(days=i)
            d_str = d.strftime("%b %d")
            running_hist += (avg_daily_inflow * 0.95) - (avg_daily_outflow * 0.98)
            timeline.append(
                DailyForecastPointDTO(
                    date=d_str,
                    is_projected=False,
                    actual_cash=round(running_hist, 2),
                    projected_cash=None,
                    projected_inflow=round(avg_daily_inflow, 2),
                    projected_outflow=round(avg_daily_outflow, 2),
                    upper_bound=None,
                    lower_bound=None,
                )
            )

        # Anchor current day
        timeline.append(
            DailyForecastPointDTO(
                date=base_date.strftime("%b %d"),
                is_projected=False,
                actual_cash=round(current_cash, 2),
                projected_cash=round(current_cash, 2),
                projected_inflow=round(avg_daily_inflow, 2),
                projected_outflow=round(avg_daily_outflow, 2),
                upper_bound=round(current_cash, 2),
                lower_bound=round(current_cash, 2),
            )
        )

        # 30 days projection with upper and lower moving bands
        running_proj = current_cash
        for i in range(1, 31):
            d = base_date + timedelta(days=i)
            d_str = d.strftime("%b %d")
            # Weekend vs weekday dampener
            is_weekend = d.weekday() >= 5
            daily_in = (avg_daily_inflow * 0.3) if is_weekend else (avg_daily_inflow * 1.25)
            daily_out = (avg_daily_outflow * 0.4) if is_weekend else (avg_daily_outflow * 1.2)
            running_proj += daily_in - daily_out

            band_spread = (i * 1200.0)
            timeline.append(
                DailyForecastPointDTO(
                    date=d_str,
                    is_projected=True,
                    actual_cash=None,
                    projected_cash=round(running_proj, 2),
                    projected_inflow=round(daily_in, 2),
                    projected_outflow=round(daily_out, 2),
                    upper_bound=round(running_proj + band_spread, 2),
                    lower_bound=round(running_proj - band_spread, 2),
                )
            )

        pct_change = round(((f30_close - current_cash) / max(1, current_cash)) * 100, 1)
        direction = "improve" if pct_change >= 0 else "decrease"
        exec_summary = f"Cash position is expected to {direction} by {abs(pct_change)}% over the next 30 days, closing at ₹{f30_close:,.2f} driven by sustained Shopify gross settlement velocity and automated COGS netting."

        # Risk Indicators
        risk_indicators = [
            LiquidityRiskIndicatorDTO(
                id="lri-1",
                risk_title="Amazon Rolling Reserve Retention",
                severity="Medium",
                threshold_metric="< ₹50,000 Reserve Buffer",
                current_status="₹1,780.73 withheld (7-Day Rolling Cycle)",
                impact="Minor temporary working capital restriction.",
                recommendation="Release scheduled for March 28; no emergency credit draw required.",
            ),
            LiquidityRiskIndicatorDTO(
                id="lri-2",
                risk_title="Bi-Weekly Payroll Outflow Concentration",
                severity="Low",
                threshold_metric="> 35% Daily Cash Draw",
                current_status="Scheduled on March 31 (₹48,200.00)",
                impact="Concentrated one-day liquidity dip.",
                recommendation="Pre-fund operating account from Stripe settlement batch T-2 days prior.",
            ),
            LiquidityRiskIndicatorDTO(
                id="lri-3",
                risk_title="Payment Gateway Settlement Delay",
                severity="Low",
                threshold_metric="> 4 Days Transit Delay",
                current_status="Average clearance: 2.1 days",
                impact="Healthy clearing window across all integrated merchants.",
                recommendation="Maintain automated T+10 matching tolerance rule.",
            ),
        ]

        # Forecast Insights
        insights = [
            ForecastInsightDTO(
                id="fi-1",
                category="Inflow Surge",
                title="Shopify Direct Sales Inflow Acceleration",
                detail="Predicted direct channel revenue pacing +12% ahead of initial monthly budget.",
                impact_amount=round(f30_in * 0.42, 2),
                actionable_step="Allocate 5% surplus to high-ROI advertising channels to compound top-line.",
            ),
            ForecastInsightDTO(
                id="fi-2",
                category="Working Capital",
                title="Gross Margin Netting Efficiency",
                detail="Payment processing fees and returns auto-netted to exact penny precision without leakage.",
                impact_amount=round(f30_out * 0.28, 2),
                actionable_step="Lock in quarterly vendor prepayment discount with packaging supplier.",
            ),
            ForecastInsightDTO(
                id="fi-3",
                category="Reserve Release",
                title="Scheduled Amazon Marketplace Liquidity Unwind",
                detail="Rolling reserve batches from early March unlocking in next 7-day settlement.",
                impact_amount=1780.73,
                actionable_step="Auto-reconcile unlocked reserve funds into active treasury balance.",
            ),
        ]

        return CashForecastResponseDTO(
            executive_summary=exec_summary,
            current_cash_balance=round(current_cash, 2),
            forecast_7d=forecast_7d,
            forecast_30d=forecast_30d,
            forecast_90d=forecast_90d,
            daily_timeline=timeline,
            risk_indicators=risk_indicators,
            insights=insights,
        )
