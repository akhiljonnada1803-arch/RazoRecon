from fastapi import APIRouter, Request, Header, HTTPException
from typing import Optional, Dict, Any
from app.services.payment_service import payment_service

router = APIRouter()

@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature")
):
    """
    Process incoming Razorpay Webhooks (payment.captured, order.paid, payment.failed)
    and automatically reconcile transactions.
    """
    try:
        raw_body_bytes = await request.body()
        raw_body = raw_body_bytes.decode("utf-8")
        payload = await request.json()
        
        result = payment_service.process_webhook(
            raw_body=raw_body,
            signature_header=x_razorpay_signature,
            payload=payload
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing error: {str(e)}")
