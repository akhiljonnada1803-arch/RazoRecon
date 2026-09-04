from fastapi import APIRouter, Query, Body
from typing import Optional, Dict, Any, List
from app.services.audit_service import audit_service

router = APIRouter()

@router.get("/logs")
def get_audit_logs(limit: int = Query(50, ge=1, le=200), event_type: Optional[str] = Query("ALL")):
    """Retrieve chronological audit logs across commerce, checkout, and finance actions."""
    return audit_service.get_logs(limit=limit, event_type=event_type)

@router.get("/timeline")
def get_audit_timeline():
    """Retrieve visual timeline view of recent commerce & financial state transitions."""
    return audit_service.get_timeline()

@router.get("/compliance")
def get_compliance_status():
    """Retrieve regulatory compliance invariants, GST e-invoicing verification, and ledger health."""
    return audit_service.get_compliance_status()

@router.post("/logs")
def log_event(payload: Dict[str, Any] = Body(...)):
    """Log an audit event into the immutable compliance ledger."""
    return audit_service.log_event(
        event_type=payload.get("event_type", "COMMERCE_EVENT"),
        actor=payload.get("actor", "System"),
        actor_role=payload.get("actor_role", "OPERATOR"),
        summary=payload.get("summary", "Commerce action logged"),
        entity_type=payload.get("entity_type", "COMMERCE"),
        entity_id=payload.get("entity_id"),
        metadata=payload.get("metadata", {}),
        status=payload.get("status", "SUCCESS")
    )
