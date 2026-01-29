import httpx
from django.conf import settings
from ninja.errors import HttpError
from app.back_end.models import Aircraft, Soldier # Your local models

class GriffinClient:
    def __init__(self):
        self.base_url = settings.GRIFFIN_API_URL 
        self.headers = {"Authorization": f"Bearer {settings.GRIFFIN_API_KEY}"}

    def sync_aircraft_data(self, uic: str):
        """
        Evokes Griffin's 'list_aircraft' and 'get_aircraft_details' 
        to populate the local MILDS Aircraft model.
        """
        with httpx.Client(base_url=self.base_url, headers=self.headers) as client:
            # 1. Call the Griffin endpoint you shared earlier
            response = client.get("/aircraft/details", params={"uic": uic})
            print("RAW GRIFFIN DATA:", response.json())
            if response.status_code != 200:
                raise HttpError(response.status_code, "Failed to fetch from Griffin")

            data = response.json() # Returns List[UnitGroupOut] based on your previous schema

            # 2. Parse and Update Local DB
            # Note: The structure requires digging into the nested JSON (Unit -> Model -> Aircraft)
            for unit_group in data:
                for model_group in unit_group['models']:
                    for remote_plane in model_group['aircraft']:
                        
                        # Map Griffin Data -> MILDS Aircraft Model
                        Aircraft.objects.update_or_create(
                            # Assuming serial is unique, usually we map ID to pk, 
                            # but here we might need to look up by serial if PKs don't match across systems.
                            # Ideally: aircraft_pk=remote_plane['id']
                            model_name=remote_plane['airframe']['model'], 
                            defaults={
                                "status": remote_plane['status'],
                                "rtl": remote_plane['rtl'],
                                "current_unit": unit_group['unit_short_name'],
                                "total_airframe_hours": remote_plane['total_airframe_hours'],
                                "hours_to_phase": remote_plane['hours_to_phase'],
                                "location": remote_plane['location']['id'] if remote_plane['location'] else None,
                                "remarks": remote_plane['remarks'],
                                # "date_down": remote_plane['date_down'], # Ensure this exists in the remote schema
                            }
                        )

    def inject_aircraft_status(self, serial: str, new_status: str, remarks: str):
        """
        This is the INJECTION function.
        Since the Griffin code you shared was READ-ONLY, you must assume/create 
        a POST endpoint on Griffin to handle this.
        """
        payload = {
            "status": new_status,
            "remarks": remarks,
            "simulated_injection": True # Flag to tell Griffin this is a drill
        }
        
        with httpx.Client(base_url=self.base_url, headers=self.headers) as client:
            response = client.post(f"/aircraft/{serial}/status", json=payload)
            return response.json()