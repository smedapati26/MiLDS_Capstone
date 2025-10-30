from django.test import TestCase, tag
from ninja.testing import TestClient

from aircraft.api.inspections.routes import inspection_router
from utils.tests import create_single_test_insp_ref, create_test_aircraft_in_all, create_test_units, create_test_user


@tag("aircraft")
class InspectionReferenceTest(TestCase):
    def setUp(self):
        # create unit to house test aircraft
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create User for authentication
        self.user = create_test_user(unit=self.units_created[0])
        # Create Aircraft in Unit
        self.unit_aircraft = create_test_aircraft_in_all(self.units_created)
        self.aircraft_models = [aircraft.model for aircraft in self.unit_aircraft]
        # create inspection reference object
        self.inspection_reference = create_single_test_insp_ref(model=self.aircraft_models[0])
        self.client = TestClient(inspection_router, headers={"Auth-User": self.user.user_id})
        self.unauthorized_client = TestClient(inspection_router, headers={"Auth-User": "FAKE_USER"})

    def test_list_inspection_references_valid_model(self):
        response = self.client.get(f"/inspection-types?model={self.aircraft_models[0]}")
        self.assertEqual(response.status_code, 200)
        # Should return 1 inspection reference
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["common_name"], "TESTINSP")

    def test_list_inspection_references_invalid_model(self):
        response = self.client.get("/inspection-types?model=FAKEMODEL")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)  # No inspections for Fake Model

    def test_list_inspection_references_unauthorized_user(self):
        response = self.unauthorized_client.get(f"/inspection-types?model={self.aircraft_models[0]}")
        self.assertEqual(response.status_code, 401)
