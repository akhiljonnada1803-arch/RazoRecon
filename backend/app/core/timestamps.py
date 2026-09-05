"""Standard ISO 8601 UTC Timestamp Utilities for Enterprise Commerce Audit Trail."""
from datetime import datetime, timezone
from typing import Optional

def utcnow_iso() -> str:
    """Return current UTC timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def format_iso(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime object into ISO 8601 UTC string."""
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def parse_iso(ts_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO 8601 string into UTC datetime object."""
    if not ts_str:
        return None
    try:
        cleaned = ts_str.replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned).astimezone(timezone.utc)
    except Exception:
        return None
