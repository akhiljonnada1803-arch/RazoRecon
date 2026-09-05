from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class VolumeDiscountTierOfferDTO(BaseModel):
    min_qty: int
    max_qty: Optional[int] = None
    discount_pct: float
    offer_text: Optional[str] = None
    effective_unit_price: Optional[float] = None
    total_savings: Optional[float] = None

class A2ADialogueMessageDTO(BaseModel):
    id: str
    sender: str # "buyer_agent" | "seller_agent"
    sender_name: str
    sender_role: str
    timestamp: str
    message: str
    thought_process: Optional[str] = None
    volume_discount_offer: Optional[List[Dict[str, Any]]] = None
    recommended_quantity: Optional[int] = None
    savings_amount: Optional[float] = None
    structured_payload: Optional[Dict[str, Any]] = None

class A2ALedgerEntryDTO(BaseModel):
    account_code: str
    account_name: str
    debit: float
    credit: float
    description: str

class A2ASimulationStepDTO(BaseModel):
    step_number: int # 1 to 6
    step_id: str # "search_product" | "negotiate" | "generate_cart" | "create_payment" | "verify_payment" | "update_ledger"
    title: str
    description: str
    status: str # "pending" | "in_progress" | "completed"
    duration_ms: int
    dialogue: List[A2ADialogueMessageDTO] = []
    output_summary: Optional[str] = None
    state_snapshot: Optional[Dict[str, Any]] = None

class A2APresetScenarioDTO(BaseModel):
    id: str
    title: str
    industry: str
    buyer_persona: str
    seller_persona: str
    requirement_prompt: str
    initial_budget: float
    target_items_count: int

class A2ASimulationRequestDTO(BaseModel):
    scenario_id: Optional[str] = "scenario_retail_expansion"
    custom_prompt: Optional[str] = None
    buyer_budget: Optional[float] = None

class A2ASimulationResponseDTO(BaseModel):
    simulation_id: str
    scenario_title: str
    buyer_name: str
    buyer_persona: str
    seller_name: str
    seller_persona: str
    total_duration_ms: int
    steps: List[A2ASimulationStepDTO]
    final_cart: Dict[str, Any]
    final_payment: Dict[str, Any]
    final_ledger: List[A2ALedgerEntryDTO]
    reconciliation_status: str
    created_at: str
    created_order_id: Optional[str] = None
    created_order_number: Optional[str] = None
    tracking_id: Optional[str] = None
    awb_number: Optional[str] = None
    delivery_partner: Optional[str] = None
    invoice_url: Optional[str] = None
