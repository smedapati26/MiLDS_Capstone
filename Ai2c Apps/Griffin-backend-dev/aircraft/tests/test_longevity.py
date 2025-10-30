from django.test import TestCase, tag
from ninja.testing import TestClient

from aircraft.api.components.routes import component_router
from auto_dsr.models import Unit
from utils.tests import (
    create_single_longevity,
    create_single_test_aircraft,
    create_single_test_part_life_limit,
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
)


@tag("aircraft", "longevity")
class TestLongevity(TestCase):
    """
    Test Longevity Endpoint
    """

    def setUp(self):
        """
        Configure test data
        """
        self.units, _ = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.unit_aircraft = create_test_aircraft_in_all(self.units)
        self.unit_aircraft_e = create_single_test_aircraft(current_unit=self.units[0], model="AH-64E", mds="AH-64E")
        self.other_units, _ = create_test_units(
            uic_stub="TST0001",
            echelon="BN",
            short_name="101th TEST",
            display_name="101th Test Aviation Regiment",
        )

        self.other_aircraft = create_test_aircraft_in_all(Unit.objects.filter(uic__icontains="TST0001"))

        self.life_limits = []
        self.life_limits.append(create_single_test_part_life_limit(tbo=1001))
        self.life_limits.append(create_single_test_part_life_limit(model_name="AH-64E"))
        self.life_limits.append(create_single_test_part_life_limit(model_name=self.unit_aircraft[0].airframe.model))
        self.life_limits.append(
            create_single_test_part_life_limit(
                tbo=None, model_name="AH-64E", maot=10.1, part_number="123456789", component_type=None
            )
        )

        self.longevity = []
        self.longevity.append(
            create_single_longevity(
                aircraft=self.unit_aircraft[0],
                uic=self.units[0],
                part_number=self.life_limits[0].part_number,
                outcome_causal=False,
                consq="condemnation",
                x_2410_id="1",
                outcome_fh=3030.30,
            )
        )
        self.longevity.append(
            create_single_longevity(
                aircraft=self.unit_aircraft_e,
                uic=self.units[0],
                part_number=self.life_limits[0].part_number,
                outcome_causal=False,
                consq="condemnation",
                x_2410_id="2",
                outcome_fh=1010.10,
            )
        )
        self.longevity.append(
            create_single_longevity(
                aircraft=self.other_aircraft[0],
                uic=Unit.objects.get(uic="TST0001A0"),
                part_number=self.life_limits[0].part_number,
                outcome_causal=False,
                consq="condemnation",
                x_2410_id="3",
                outcome_fh=5050.50,
            )
        )
        self.longevity.append(
            create_single_longevity(
                aircraft=self.unit_aircraft_e,
                uic=self.units[0],
                part_number="123456789",
                outcome_causal=True,
                consq="Test",
                x_2410_id="4",
                outcome_fh=12.12,
            )
        )

        self.user = create_test_user(unit=self.units[0])
        self.client = TestClient(component_router, headers={"Auth-User": self.user.user_id})

    def test_longevity_route_tbo_more_than_one(self):
        """
        Longevity test where more than one tbo is found
        """
        response = self.client.get(f"/longevity?uic={self.units[0].uic}&part_number=7-12345678-9")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"message": "More than one TBO or MAOT found."})

    def test_longevity_route_valid(self):
        """
        Longevity test for matching model.
        """
        response = self.client.get(
            f"/longevity?uic={self.units[0].uic}&part_number=7-12345678-9&model={self.unit_aircraft[0].model}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"tbo": 1000.0, "value_type": "tbo", "unit_average": 3030.3, "fleet_average": 4040.4}
        )

    def test_longevity_route_part_not_found(self):
        """
        Longevity test for part not in Part Life table
        """
        response = self.client.get(f"/longevity?uic={self.units[0].uic}&part_number=1-111-1111")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"message": "No data found for part 1-111-1111 and model None"})

    def test_longevity_route_causal(self):
        """
        Longevity test to check for causal = true condition.
        """
        response = self.client.get(f"/longevity?uic={self.units[0].uic}&part_number=123456789")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"tbo": 10.1, "value_type": "maot", "unit_average": 12.12, "fleet_average": 12.12}
        )
