from django.test import TestCase, tag
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_airframe,
    create_single_test_insp_ref,
    create_single_test_unit,
    create_test_user,
)


@tag("auto_dsr")
class InspectionReferenceTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.unit = create_single_test_unit()
        # Create User for authentication
        self.user = create_test_user(unit=self.unit)
        # Create Airframe to attach to Aircraft
        airframe = create_single_test_airframe()
        # Create Aircraft in Unit
        self.unit_aircraft = create_single_test_aircraft(current_unit=self.unit, airframe=airframe)

        self.client = TestClient(auto_dsr_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(auto_dsr_router, headers={"Auth-User": "FAKE_USER"})

    def test_read_bank_time_valid(self):
        response = self.client.get(f"/bank-time-forecast?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(response.data.keys())[0], "TH-10A")

    def test_read_bank_time_invalid_unit(self):
        response = self.client.get("/bank-time-forecast?uic=FAKE_UNIT")
        self.assertEqual(response.status_code, 404)

    def test_read_bank_time_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/bank-time-forecast?uic={self.unit.uic}")
        self.assertEqual(response.status_code, 401)
