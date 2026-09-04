from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class InjectedAnomalyDTO(BaseModel):
    category: str  # "Tax Mismatch" | "Duplicate Payment" | "Missing Invoice" | "Settlement Delay"
    count: int
    description: str
    impact: str
    target_entities: List[str]

class DemoGenerationResultDTO(BaseModel):
    status: str
    message: str
    generated_at: str
    invoices_generated: int
    settlements_generated: int
    transactions_generated: int
    anomalies_injected: List[InjectedAnomalyDTO]
    summary_stats: Dict[str, Any]

class GenerateDemoRequestDTO(BaseModel):
    scenario_preset: Optional[str] = "E-Commerce FinOps Multi-Channel"
    seed: Optional[int] = 42
    scale_invoices: Optional[int] = 100
    scale_settlements: Optional[int] = 100
    scale_transactions: Optional[int] = 100

class OneClickDemoFlowResultDTO(BaseModel):
    status: str = "Demo Account Connected & Reconciled"
    message: str = "Successfully ingested 500 Razorpay payments, executed deterministic reconciliation, updated memory engine, scored counterparties, and synthesized executive CFO brief."
    payments_imported: int = 500
    matched: int = 470
    match_rate: float = 94.0
    exceptions_count: int = 30
    risk_profiles_updated: int = 22
    top_risk_vendors: List[Dict[str, Any]]
    fraud_alerts: List[Dict[str, Any]]
    cash_forecast: Dict[str, Any]
    cfo_summary: str
    execution_trace: List[str]
