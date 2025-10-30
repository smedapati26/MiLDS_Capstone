from django.test import TestCase, tag
from ninja.testing import TestClient

from aircraft.api.equipment.routes import equipment_router
from utils.tests import (
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("equipment")
class EquipmentRouteTests(TestCase):
    def setUp(self):
        self.units_created, _ = create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        aircraft = create_test_aircraft_in_all(self.units_created, num_of_aircraft=5)

        self.user = create_test_user(self.top_unit)
        self.client = TestClient(equipment_router, headers={"Auth-User": self.user.user_id})

        for i, air in enumerate(aircraft):
            air.rtl = "NRTL"
            air.status = "FMC"
            air.hours_to_phase = 10.0

            if i % 2 == 0:
                air.rtl = "RTL"

            if i % 3 == 0:
                air.hours_to_phase = 0.0
                air.status = "PMCM"

            if i % 4 == 0:
                air.status = "NMCS"

            if i % 5 == 0:
                air.status = "FIELD"

            if i % 6 == 0:
                air.status = "DADE"

            air.save()

    def test_aircraft_models_and_status(self):
        response = self.client.get(f"/aircraft-model-status?uic={self.top_unit.uic}")
        self.assertEqual(response.status_code, 200)
        expected = [
            {
                "model": "TH-10A",
                "total": 65,
                "rtl": 33,
                "nrtl": 32,
                "in_phase": 22,
                "fmc_count": 26,
                "fmc_percent": 0.4,
                "pmc_count": 9,
                "pmc_percent": 0.13846153846153847,
                "nmc_count": 19,
                "nmc_percent": 0.2923076923076923,
                "dade_count": 11,
                "dade_percent": 0.16923076923076924,
            }
        ]
        self.assertEqual(response.data, expected)
