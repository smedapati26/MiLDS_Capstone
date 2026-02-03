import httpx
from django.conf import settings

class GriffinClient:
    def __init__(self):
        # The real Griffin server lives at port 8001
        self.base_url = "http://127.0.0.1:8001" 
        self.headers = {
            "Authorization": f"Bearer {getattr(settings, 'GRIFFIN_API_KEY', 'dev-key')}",
        }

    def sync_unit_data(self, uic: str):
        """
        REAL MODE: Calls the actual Griffin API
        Correct Endpoint: /aircraft/shiny/dsr/{uic}
        """
        # UPDATED URL based on your urls.py
        endpoint = f"/aircraft/shiny/dsr/{uic}"
        
        try:
            with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=10.0) as client:
                # The UIC is in the URL now, not a query param
                response = client.get(endpoint)
                
                if response.status_code != 200:
                    return {"success": False, "error": f"Griffin Error {response.status_code}: {response.text}"}
                
                return {"success": True, "data": response.json()}
        
        except httpx.RequestError as e:
            return {"success": False, "error": f"Connection Refused. Is Terminal 1 running? Error: {str(e)}"}

    def inject_aircraft_update(self, serial: str, updates: dict):
        """
        REAL MODE: Sends PATCH request to Griffin
        Correct Endpoint: /aircraft/update/{serial}
        """
        # UPDATED URL based on your urls.py
        endpoint = f"/aircraft/update/{serial}"
        
        try:
            with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=5.0) as client:
                # Send the updates directly. 
                # Note: If Griffin expects a list, we might need to wrap it, 
                # but standard REST usually expects a dict for specific ID updates.
                response = client.patch(endpoint, json=updates)
                
                if response.status_code not in [200, 204]:
                    # Fallback: some legacy endpoints expect a list
                    response = client.patch(endpoint, json=[updates])
                    if response.status_code not in [200, 204]:
                        return {"success": False, "error": response.text}
                
                data = response.json() if response.status_code != 204 else {}
                return {"success": True, "data": data}

        except httpx.RequestError as e:
            return {"success": False, "error": f"Connection Refused. Is Terminal 1 running? Error: {str(e)}"}