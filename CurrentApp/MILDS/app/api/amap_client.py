import httpx
from django.conf import settings
from ninja.errors import HttpError
from app.back_end.models import Soldier

class AmapClient:
    def __init__(self):
        self.base_url = settings.AMAP_API_URL
        # AMAP requires X-On-Behalf-Of for updates to track who made the change
        self.headers = {
            "Authorization": f"Bearer {settings.AMAP_API_KEY}",
            "X-On-Behalf-Of": settings.MILDS_SYSTEM_USER_ID  # ID of the O.C. or System Admin
        }

    def sync_unit_roster(self, uic: str):
        """
        Evokes AMAP's 'get_unit_soldiers' (type='all_soldiers')
        and updates the local MILDS Soldier table.
        """
        endpoint = f"/personnel/units/soldiers/{uic}/all_soldiers"
        
        with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=10.0) as client:
            response = client.get(endpoint)
            
            if response.status_code != 200:
                return {"success": False, "error": response.text}
            
            return {"success": True, "data": response.json()}
        
 

    def inject_soldier_update(self, user_id: str, updates: dict):
        """
        Evokes AMAP's update_soldier_info
        """
        # --- CORRECTED URL ---
        # Old: endpoint = f"/personnel/{user_id}/update/"
        # New: Matches the 'personnel/soldiers/update-info/<str:user_id>' pattern found in logs
        endpoint = f"/personnel/soldiers/update-info/{user_id}" 

        try:
            with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=5.0) as client:
                # The log shows the name is 'update_soldier_info', usually accepts POST or PATCH
                response = client.patch(endpoint, json=updates)
                
                if response.status_code != 200:
                    return {
                        "success": False, 
                        "error": response.text, 
                        "status": response.status_code
                    }
                
                return {"success": True, "data": response.json()}

        except httpx.RequestError as e:
            return {"success": False, "error": f"Could not connect to AMAP: {str(e)}"}
    # Inside your AmapClient class:
    def inject_casualty_flag(self, user_id: str, casualty_type: str):
        """
        Evokes AMAP's 'shiny_create_soldier_flag' endpoint.
        """
        endpoint = "/personnel/flags/create"
        
        # Based on your SoldierFlag model mirror, AMAP likely expects these fields:
        payload = {
            "soldier_id": user_id,  # Might be 'user_id' depending on AMAP's exact schema
            "start_date": str(date.today()),
            "flag_remarks": f"SIMULATION EVENT: {casualty_type}"
        }

        try:
            with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=5.0) as client:
                response = client.post(endpoint, json=payload)
                
                if response.status_code not in [200, 201]:
                    return {
                        "success": False, 
                        "error": response.text, 
                        "status": response.status_code
                    }
                
                return {"success": True, "data": response.json()}

        except httpx.RequestError as e:
            return {"success": False, "error": f"Could not connect to AMAP: {str(e)}"}