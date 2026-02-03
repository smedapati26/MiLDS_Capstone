# app/back_end/tests/test_aircraft_sync.py

from django.test import TestCase, Client
from unittest.mock import patch
from app.back_end.models import Aircraft


class AircraftSyncAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch("app.api.griffin_client.GriffinClient.sync_unit_data")
    def test_sync_creates_aircraft(self, mock_sync):
        # Fake Griffin response
        mock_sync.return_value = {
            "success": True,
            "data": {
                "aircraft": [
                    {
                        "serial": "SYNC-0001",
                        "model": "UH-60M",
                        "status": "FMC",
                        "rtl": "NRTL",
                        "current_unit": "WDDRA0",
                        "total_airframe_hours": 100.0,
                        "hours_to_phase": 25.0,
                        "remarks": "From test",
                        "last_sync_time": None,
                        "last_export_upload_time": None,
                        "last_update_time": None,
                    }
                ]
            }
        }

        # Call the sync endpoint
        response = self.client.post("/api/aircraft/sync/WDDRA0")

        self.assertEqual(response.status_code, 200)

        # Verify aircraft was saved
        self.assertEqual(Aircraft.objects.count(), 1)

        ac = Aircraft.objects.first()
        self.assertEqual(ac.serial, "SYNC-0001")
        self.assertEqual(ac.model_name, "UH-60M")
        self.assertEqual(ac.status, "FMC")