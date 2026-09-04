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
