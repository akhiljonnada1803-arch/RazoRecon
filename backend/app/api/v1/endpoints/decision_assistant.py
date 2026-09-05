from fastapi import APIRouter, Path, HTTPException
from app.schemas.decision_assistant import PrePurchaseDecisionDTO
from app.services.decision_assistant_service import decision_assistant_service

router = APIRouter()

@router.get("/{product_id}", response_model=PrePurchaseDecisionDTO)
def get_pre_purchase_decision_analysis(
    product_id: str = Path(..., description="ID or SKU of the selected product")
):
    """
    Generate comprehensive AI Pre-Purchase Decision analysis when customer selects a product:
    1. Product Summary
    2. Pros
    3. Cons
    4. Rating Analysis
    5. Review Analysis
    6. EMI Suggestions
    7. Similar Alternatives (evaluated on High ratings, Low refund history, and Positive review sentiment)
    """
    try:
        return decision_assistant_service.get_pre_purchase_decision(product_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate pre-purchase analysis: {str(e)}")
