from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import Event
from personnel.api.readiness.routes import router
from personnel.model_utils import MaintenanceLevel, MxAvailability
from personnel.models import MOSCode, Soldier, SoldierFlag
from units.models import Unit
from utils.tests import create_user_role_in_all


@tag("GetUnavailableAndInexperienced")
class TestMaintainerEndpoints(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        # Create base test data
        self.parent_unit = Unit.objects.create(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display", level=0, as_of_logical_time=0
        )
        self.child_unit = Unit.objects.create(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Unit Display",
            parent_unit=self.parent_unit,
            level=1,
            as_of_logical_time=0,
        )

        # Set up unit hierarchies
        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        # Create MOS codes
        self.mos_15R = MOSCode.objects.create(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15T = MOSCode.objects.create(mos="15T", mos_description="UH-60 Helicopter Repairer")

        # Create test soldiers
        # Test maintainer without primary MOS
        self.soldier = Soldier.objects.create(
            user_id="1234567893",
            first_name="John",
            last_name="Doe",
            unit=self.parent_unit,
            is_maintainer=True,
        )
        self.soldier1 = Soldier.objects.create(
            user_id="1234567890",
            first_name="John",
            last_name="Doe",
            unit=self.parent_unit,
            primary_mos=self.mos_15R,
            is_maintainer=True,
        )
        self.soldier2 = Soldier.objects.create(
            user_id="0987654321",
            first_name="Jane",
            last_name="Smith",
            unit=self.child_unit,
            primary_mos=self.mos_15T,
            is_maintainer=True,
        )

        # Create events to set maintenance levels
        self.today = date.today()
        Event.objects.create(
            soldier=self.soldier1,
            date=self.today - timedelta(days=10),
            uic=self.parent_unit,
            maintenance_level=MaintenanceLevel.ML2,
        )
        Event.objects.create(
            soldier=self.soldier2,
            date=self.today - timedelta(days=5),
            uic=self.child_unit,
            maintenance_level=MaintenanceLevel.ML1,
        )

        # Create unavailability flags
        SoldierFlag.objects.create(
            soldier=self.soldier1,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=self.today - timedelta(days=5),
            end_date=self.today + timedelta(days=5),
        )

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.parent_unit])

    def test_get_unavailable_maintainers(self):
        response = self.client.get(f"/unit/unavailable?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["mos"], "15R")
        self.assertEqual(response.json()[0]["ml"], MaintenanceLevel.ML2)
        self.assertEqual(response.json()[0]["count"], 1)

    def test_get_inexperienced_maintainers(self):
        response = self.client.get(f"/unit/inexperienced?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
        results = response.json()
        self.assertEqual(len(results), 1)
        results.sort(key=lambda x: x["mos"])
        self.assertEqual(results[0]["mos"], "15T")
        self.assertEqual(results[0]["ml"], MaintenanceLevel.ML1)
        self.assertEqual(results[0]["count"], 1)

    def test_edge_cases(self):
        response = self.client.get(f"/unit/unavailable?uic=INVALID")
        self.assertEqual(response.status_code, 404)
        Event.objects.all().delete()
        Event.objects.create(
            soldier=self.soldier,
            date=self.today,
            uic=self.parent_unit,
            maintenance_level=MaintenanceLevel.ML1,
        )

        response = self.client.get(f"/unit/inexperienced?uic={self.parent_unit.uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)
