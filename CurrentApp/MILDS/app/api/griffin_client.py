import httpx
from django.conf import settings

class GriffinClient:
    def __init__(self):
        # Pulls from Django settings, falls back to localhost for local testing
        self.base_url = getattr(settings, 'GRIFFIN_API_URL', "http://127.0.0.1:8001") 
        self.headers = {
            "Authorization": f"Bearer {getattr(settings, 'GRIFFIN_API_KEY', 'dev-key')}",
            "X-On-Behalf-Of": str(getattr(settings, 'MILDS_SYSTEM_USER_ID', "1234567890")),
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
        REAL MODE: Sends POST request to Griffin
        Correct Endpoint: /aircraft/update/{serial}
        """
        endpoint = f"/aircraft/update/{serial}"
        
        try:
            with httpx.Client(base_url=self.base_url, headers=self.headers, timeout=5.0) as client:
                # We use .post because Terminal 1 showed '405 Method Not Allowed' on PATCH
                response = client.post(endpoint, json=updates)
                
                if response.status_code not in [200, 204]:
                    print("GRIFFIN RESPONSE STATUS:", response.status_code)
                    print("GRIFFIN RESPONSE BODY:", response.text)
                    return {"success": False, "error": response.text}

                # Safely handle empty or non-JSON responses
                try:
                    data = response.json() if response.content else {}
                except Exception:
                    print("GRIFFIN RETURNED NON-JSON RESPONSE:")
                    print(response.text)
                    data = {}

                return {"success": True, "data": data}

        except httpx.RequestError as e:
            return {"success": False, "error": f"Connection Refused. Error: {str(e)}"}