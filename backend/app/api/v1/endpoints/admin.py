from fastapi import APIRouter, HTTPException, Query, Path, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.services.admin_service import admin_service

router = APIRouter()

class CreateApiKeyRequest(BaseModel):
    name: str
    environment: str = "TEST"

class CreateWebhookRequest(BaseModel):
    url: str
    events: List[str]

@router.get("/users")
def list_admin_users():
    """List all registered enterprise operators, their roles, and access state."""
    return admin_service.get_users()

@router.get("/roles")
def list_admin_roles():
    """List all enterprise RBAC roles and their granted permission policies."""
    return admin_service.get_roles()

@router.get("/merchants")
def list_merchants():
    """List onboarded merchants, GSTIN, tier, and Razorpay account connectivity."""
    return admin_service.get_merchants()

@router.get("/integrations")
def list_integrations():
    """List active payment gateways, webhooks, and ERP accounting connectors."""
    return admin_service.get_integrations()

@router.get("/api-keys")
def list_api_keys():
    """List all platform API keys for autonomous AI buyers and ERP connectors."""
    return admin_service.get_api_keys()

@router.post("/api-keys")
def create_api_key(payload: CreateApiKeyRequest):
    """Create a new developer API key."""
    return admin_service.create_api_key(name=payload.name, environment=payload.environment)

@router.delete("/api-keys/{key_id}")
def revoke_api_key(key_id: str = Path(...)):
    """Revoke a developer API key."""
    success = admin_service.revoke_api_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="API Key not found")
    return {"status": "revoked", "key_id": key_id}

@router.get("/webhooks")
def list_webhooks():
    """List registered webhooks for order, payment, and inventory event broadcasting."""
    return admin_service.get_webhooks()

@router.post("/webhooks")
def create_webhook(payload: CreateWebhookRequest):
    """Register a new webhook endpoint."""
    return admin_service.create_webhook(url=payload.url, events=payload.events)

@router.delete("/webhooks/{webhook_id}")
def delete_webhook(webhook_id: str = Path(...)):
    """Remove a webhook endpoint."""
    admin_service.delete_webhook(webhook_id)
    return {"status": "deleted", "webhook_id": webhook_id}

@router.get("/ai-buyer-logs")
def list_ai_buyer_logs(limit: int = Query(default=50, ge=1, le=100)):
    """Retrieve autonomous AI Buyer request traces and token consumption metrics."""
    return admin_service.get_ai_buyer_logs(limit=limit)

@router.get("/protocol-monitoring")
def get_protocol_monitoring():
    """Retrieve Commerce Protocol v1.4 latency, uptime, and endpoint health status."""
    return admin_service.get_protocol_monitoring()
