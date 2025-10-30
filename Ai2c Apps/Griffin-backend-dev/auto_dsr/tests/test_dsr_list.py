from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.models import Unit
from utils.tests import create_test_units, create_test_user
from utils.tests.test_aircraft_creation import create_single_test_aircraft
from utils.tests.test_unit_creation import get_transient_unit
from utils.tests.test_user_role_creation import create_user_role_in_all


@tag("transfer_request")
class TransferRequestTest(TestCase):

    def setUp(self):
        create_test_units(transient_unit_needed=True)

        self.transient_unit = get_transient_unit()

        self.now = timezone.now()
        self.now_format = self.now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        self.unit_0AA = Unit.objects.get(uic="TEST000AA")
        self.unit_0A0 = Unit.objects.get(uic="TEST000A0")
        self.unit_1AA = Unit.objects.get(uic="TEST001AA")
        self.unit_1A0 = Unit.objects.get(uic="TEST001A0")
        self.unit_2AA = Unit.objects.get(uic="TEST002AA")

        self.aircraft = create_single_test_aircraft(
            current_unit=self.unit_0A0,
            serial="AIRCRAFT0A01",
            last_sync_time=self.now,
            last_export_upload_time=self.now,
            last_update_time=self.now,
        )
        self.aircraft2 = create_single_test_aircraft(
            current_unit=self.unit_0AA,
            serial="AIRCRAFT0A02",
            last_sync_time=self.now,
            last_export_upload_time=self.now,
            last_update_time=self.now,
        )
        self.aircraft3 = create_single_test_aircraft(
            current_unit=self.transient_unit,
            serial="AIRCRAFT0A03",
            last_sync_time=self.now,
            last_export_upload_time=self.now,
            last_update_time=self.now,
        )

        self.admin_user = create_test_user(unit=self.unit_0AA, is_admin=True)

        create_user_role_in_all(self.admin_user, [self.unit_0AA, self.unit_0A0, self.unit_1A0])

        self.admin_client = TestClient(auto_dsr_router, headers={"Auth-User": self.admin_user.user_id})

    def test_default_objects(self):
        response = self.admin_client.get("")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        # Check that location is a nested object
        if response.data[0].get("location"):
            self.assertIsInstance(response.data[0]["location"], dict)
            self.assertIn("name", response.data[0]["location"])
        # Check modifications field
        self.assertIn("modifications", response.data[0])
        self.assertIsInstance(response.data[0]["modifications"], list)
        # Since no modifications are created in setUp, it should be empty
        self.assertEqual(len(response.data[0]["modifications"]), 0)

    def test_uic_objects(self):
        response = self.admin_client.get(f"?uic={self.unit_0A0.uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["owning_unit_uic"], self.unit_0A0.uic)
        # Check that location is a nested object
        if response.data[0].get("location"):
            self.assertIsInstance(response.data[0]["location"], dict)
            self.assertIn("name", response.data[0]["location"])
        # Check modifications field
        self.assertIn("modifications", response.data[0])
        self.assertIsInstance(response.data[0]["modifications"], list)
        self.assertEqual(len(response.data[0]["modifications"]), 0)

    def test_all_objects(self):
        response = self.admin_client.get(f"?transient={True}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        # Check that location is a nested object for each item
        for item in response.data:
            if item.get("location"):
                self.assertIsInstance(item["location"], dict)
                self.assertIn("name", item["location"])
            # Check modifications field for each item
            self.assertIn("modifications", item)
            self.assertIsInstance(item["modifications"], list)
            self.assertEqual(len(item["modifications"]), 0)
