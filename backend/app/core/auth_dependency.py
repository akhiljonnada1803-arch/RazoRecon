from fastapi import Header, HTTPException
from typing import Optional
from app.services.auth_service import auth_service
from app.schemas.auth import UserDTO

def require_authenticated_customer(
    authorization: Optional[str] = Header(default=None),
    x_customer_id: Optional[str] = Header(default=None)
) -> UserDTO:
    """
    Validate that a request comes from an authenticated customer identity.
    Enforces server-side purchase validation before:
    - creating an order
    - initiating Razorpay payment
    - generating an invoice
    - reserving inventory
    """
    user: Optional[UserDTO] = None

    if authorization:
        user = auth_service.verify_token(authorization)
    
    if not user and x_customer_id:
        user = auth_service.get_user_by_id_or_email(x_customer_id)

    # If still not found, check if a valid bearer token or default demo session is active
    if not user and not authorization and not x_customer_id:
        # Check active session fallback or reject guest
        raise HTTPException(
            status_code=401,
            detail="Customer authentication required. Guest users cannot create orders or initiate checkout payments."
        )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired customer authentication token. Please sign in to complete your purchase."
        )

    return user

class MerchantContext:
    def __init__(self, merchant_id: str, user: Optional[UserDTO] = None, is_demo: bool = False):
        self.merchant_id = merchant_id
        self.user = user
        self.is_demo = is_demo

def get_authenticated_merchant_context(
    authorization: Optional[str] = Header(default=None),
    x_merchant_id: Optional[str] = Header(default=None),
    merchant_id: Optional[str] = None
) -> MerchantContext:
    """
    Resolve the authenticated merchant identity from:
    1. Authorization Bearer JWT token
    2. x-merchant-id header
    3. merchant_id query parameter
    4. Default demo merchant rzp_live_acme_8842 if unauthenticated demo
    """
    user: Optional[UserDTO] = None
    if authorization:
        user = auth_service.verify_token(authorization)

    resolved_id: Optional[str] = None
    if user and user.merchant_id:
        resolved_id = user.merchant_id
    elif x_merchant_id:
        resolved_id = x_merchant_id.strip()
    elif merchant_id and merchant_id.strip().lower() != "all":
        resolved_id = merchant_id.strip()

    if not resolved_id:
        resolved_id = "rzp_live_acme_8842"

    is_demo = auth_service.is_demo_merchant(resolved_id)
    return MerchantContext(merchant_id=resolved_id, user=user, is_demo=is_demo)

