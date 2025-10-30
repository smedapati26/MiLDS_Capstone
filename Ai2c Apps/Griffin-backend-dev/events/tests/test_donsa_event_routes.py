import json
from datetime import datetime, timedelta

from django.test import TestCase, tag
from ninja.testing import TestClient

from events.api.routes import events_router
from events.models import DonsaEvent
from utils.tests import create_single_test_donsa_event, create_test_units, create_test_user


@tag("events")
class DONSAEventTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.begin_date = datetime.date(datetime.now().astimezone()) - timedelta(days=1)
        self.end_date = datetime.date(datetime.now().astimezone()) + timedelta(days=1)

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000001", is_admin=True)
        # Create donsa events including one to delete
        self.donsa_event = create_single_test_donsa_event(self.units_created[0])
        self.delete_event = create_single_test_donsa_event(self.units_created[0])

        self.client = TestClient(events_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(events_router, headers={"Auth-User": self.admin_user.user_id})
        self.unauthorized_client = TestClient(events_router, headers={"Auth-User": "FAKE_USER"})

    def test_list_donsa_events_valid(self):
        response = self.client.get(
            f"/donsa?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["items"][0]["notes"], "Test Notes")

    def test_list_donsa_events_invalid_unit(self):
        response = self.client.get(f"/donsa?uic=FAKEUNIT&begin_date={self.begin_date}&end_date={self.end_date}")
        self.assertEqual(response.status_code, 404)

    def test_list_donsa_events_unauthorized_user(self):
        response = self.unauthorized_client.get(
            f"/donsa?uic={self.units_created[0].uic}&begin_date={self.begin_date}&end_date={self.end_date}"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_donsa_event_valid(self):
        event_dict = {
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "notes": "Test Notes",
            "name": "Test Donsa Event",
            "unit_id": self.units_created[0].uic,
        }
        response = self.admin_client.post(
            f"/donsa", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(type(response.data["id"]), int)

    def test_create_donsa_event_with_applies_to_valid(self):
        event_dict = {
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "notes": "Test Notes",
            "name": "Test Donsa Event",
            "unit_id": self.units_created[0].uic,
            "applies_to": list(self.units_created.values_list("uic", flat=True)),
        }
        response = self.admin_client.post(
            f"/donsa", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(type(response.data["id"]), int)
        self.assertEqual(
            list(DonsaEvent.objects.get(id=response.data["id"]).applies_to.values_list("uic", flat=True)),
            list(self.units_created.values_list("uic", flat=True)),
        )

    def test_create_donsa_event_invalid_content(self):
        event_dict = {
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "notes": 10,  # INVALID TYPE
            "name": "Test Donsa Event",
            "unit_id": self.units_created[0].uic,
        }
        response = self.admin_client.post(
            f"/donsa", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_create_donsa_event_unauthorized_user(self):
        event_dict = {
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "notes": "Test Notes",
            "name": "Test Donsa Event",
            "unit_id": self.units_created[0].uic,
        }
        response = self.unauthorized_client.post(
            f"/donsa", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_create_donsa_event_no_permissions_user(self):
        event_dict = {
            "event_start": self.begin_date,
            "event_end": self.end_date,
            "notes": "Test Notes",
            "name": "Test Donsa Event",
            "unit_id": self.units_created[0].uic,
        }
        response = self.client.post(
            f"/donsa", data=json.dumps(event_dict, default=str), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_read_donsa_event_valid(self):
        response = self.client.get(f"/donsa/{self.donsa_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "TEST DONSA EVENT")

    def test_read_donsa_event_invalid_event(self):
        response = self.client.get("/donsa/200")
        self.assertEqual(response.status_code, 404)

    def test_read_donsa_event_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/donsa/{self.donsa_event.id}")
        self.assertEqual(response.status_code, 401)

    def test_update_donsa_event_valid(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.admin_client.put(
            f"/donsa/{self.donsa_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(DonsaEvent.objects.get(id=self.donsa_event.id).notes, "Test Updated Notes")

    def test_update_donsa_event_applies_to_valid(self):
        event_dict = {
            "notes": "Test Updated Notes",
            "applies_to": list(self.units_created.values_list("uic", flat=True)),
        }
        response = self.admin_client.put(
            f"/donsa/{self.donsa_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(
            list(DonsaEvent.objects.get(id=self.donsa_event.id).applies_to.values_list("uic", flat=True)),
            list(self.units_created.values_list("uic", flat=True)),
        )

    def test_update_donsa_event_invalid_content(self):
        event_dict = {"notes": 10}  # incorrect type
        response = self.admin_client.put(
            f"/donsa/{self.donsa_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 422)

    def test_update_donsa_event_invalid_event(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.admin_client.put(f"/donsa/100", data=json.dumps(event_dict), content_type="application/json")
        self.assertEqual(response.status_code, 404)

    def test_update_donsa_event_unauthorized_user(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.unauthorized_client.put(
            f"/donsa/{self.donsa_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)

    def test_update_donsa_event_no_permissions_user(self):
        event_dict = {"notes": "Test Updated Notes"}
        response = self.client.put(
            f"/donsa/{self.donsa_event.id}", data=json.dumps(event_dict), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)

    def test_delete_donsa_event_valid(self):
        response = self.admin_client.delete(f"/donsa/{self.delete_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)

    def test_delete_donsa_event_invalid_event(self):
        response = self.client.delete("/donsa/200")
        self.assertEqual(response.status_code, 404)

    def test_delete_donsa_event_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/donsa/{self.donsa_event.id}")
        self.assertEqual(response.status_code, 401)

    def test_delete_donsa_event_no_permissions_user(self):
        response = self.client.delete(f"/donsa/{self.donsa_event.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], False)
