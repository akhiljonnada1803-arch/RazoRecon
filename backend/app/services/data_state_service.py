from typing import Dict, Any

class DataStateService:
    def __init__(self):
        # Default initial state is clean zero data
        self._has_data = False

    def has_data(self) -> bool:
        return self._has_data

    def set_has_data(self, value: bool):
        self._has_data = value

    def reset_data(self):
        self._has_data = False

    def generate_demo_data(self) -> Dict[str, Any]:
        self._has_data = True
        return {
            "status": "success",
            "has_data": True,
            "message": "Demo data successfully generated across all financial operations modules.",
            "payments_imported": 500,
            "matched_transactions": 470,
            "exceptions_detected": 30,
            "vendor_profiles_scored": 22
        }

data_state_service = DataStateService()
