from fastapi import APIRouter, Query, Body, Path, Request
from typing import Optional, Dict, Any, List
from app.services.audit_service import audit_service
from app.core.timestamps import utcnow_iso

router = APIRouter()

@router.get("/logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Retrieve chronological enterprise audit logs with old/new value diffs."""
    logs = audit_service.get_audit_logs(
        limit=limit,
        entity_type=entity_type,
        action=action,
        user_id=user_id,
        role=role,
        search=search
    )
    return {"items": logs, "total": len(logs)}

@router.get("/entity/{entity_type}/{entity_id}")
def get_entity_audit_trail(
    entity_type: str = Path(..., description="Entity type (ORDER, PRODUCT, PAYMENT, MERCHANT, etc.)"),
    entity_id: str = Path(..., description="Unique entity ID")
):
    """Retrieve immutable chronological audit trail for a specific entity."""
    return audit_service.get_entity_audit_trail(entity_type=entity_type, entity_id=entity_id)

@router.get("/activity-feed")
def get_activity_feed(
    limit: int = Query(15, ge=1, le=100),
    role: Optional[str] = Query(None)
):
    """Retrieve recent formatted activity stream for Merchant and Admin dashboard widgets."""
    items = audit_service.get_recent_activity(limit=limit, role_filter=role)
    return {"feed": items, "total": len(items)}

@router.get("/timeline")
def get_audit_timeline():
    """Retrieve visual timeline view of recent commerce & financial state transitions."""
    return audit_service.get_timeline()

@router.get("/compliance")
def get_compliance_status():
    """Retrieve regulatory compliance invariants, GST e-invoicing verification, and ledger health."""
    return audit_service.get_compliance_status()

@router.post("/logs")
def log_event(payload: Dict[str, Any] = Body(...), request: Request = None):
    """Record an immutable enterprise audit log entry."""
    client_ip = request.client.host if request and request.client else "127.0.0.1"
    
    action = payload.get("action") or payload.get("event_type") or "COMMERCE_ACTION"
    entity_type = payload.get("entity_type") or "COMMERCE"
    entity_id = payload.get("entity_id")
    user_id = payload.get("user_id")
    user_name = payload.get("user_name") or payload.get("actor") or "System User"
    role = payload.get("role") or payload.get("actor_role") or "Customer"
    old_value = payload.get("old_value")
    new_value = payload.get("new_value") or payload.get("metadata")
    
    return audit_service.log_audit(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        user_name=user_name,
        role=role,
        old_value=old_value,
        new_value=new_value,
        ip_address=client_ip
    )
