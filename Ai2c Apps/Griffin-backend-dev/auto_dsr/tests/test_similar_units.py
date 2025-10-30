from django.test import TestCase, tag
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.models import Unit
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_airframe,
    create_single_test_unit,
    create_test_user,
)


@tag("auto_dsr")
class SimilarUnitsTest(TestCase):
    def setUp(self):
        # create units to house test aircraft
        self.unit = create_single_test_unit(uic="TEST_1")
        self.unit_2 = create_single_test_unit(uic="TEST_2")
        self.unit_3 = create_single_test_unit(uic="TEST_3")
        self.unit_4 = create_single_test_unit(uic="TEST_4")
        self.unit_5 = create_single_test_unit(uic="TEST_5")
        self.unit_6 = create_single_test_unit(uic="TEST_6")
        self.unit_7 = create_single_test_unit(uic="TEST_7")
        self.unit_8 = create_single_test_unit(uic="TEST_8")
        self.unit_9 = create_single_test_unit(uic="TEST_9")
        self.unit_10 = create_single_test_unit(uic="TEST_10")
        self.unit_11 = create_single_test_unit(uic="TEST_11")
        # Create User for authentication
        self.user = create_test_user(unit=self.unit)
        # Create Airframe to attach to Aircraft
        airframe = create_single_test_airframe()
        # Create Aircraft in Unit
        self.unit_aircraft = create_single_test_aircraft(current_unit=self.unit, airframe=airframe)
        self.unit_aircraft_2 = create_single_test_aircraft(
            serial="TESTAIRCRAFT_2", current_unit=self.unit_2, airframe=airframe
        )

        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(auto_dsr_router, headers={"Auth-User": "FAKE_USER"})

    def test_update_similar_units_valid(self):
        self.assertEqual(self.unit.similar_units, [])
        response = self.client.get(f"/update-similar-units")
        self.assertEqual(response.status_code, 200)
        unit = Unit.objects.get(uic=self.unit.uic)
        self.assertEqual(unit.similar_units[0], self.unit_2.uic)

    def test_read_bank_time_unauthorized_user(self):
        response = self.unauthorized_client.get(f"update-similar-units")
        self.assertEqual(response.status_code, 401)
