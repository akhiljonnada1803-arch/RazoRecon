from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.admin_service import admin_service

router = APIRouter()

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
