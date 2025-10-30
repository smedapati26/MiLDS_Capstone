import json
from http import HTTPStatus

from django.test import TestCase
from ninja.testing import TestClient

from units.api.routes import router
from units.models import Unit
from utils.tests import create_logical_clock, create_single_test_unit, create_test_user, create_testing_unit


class UnitApiTest(TestCase):
    def setUp(self):
        self.headers = {"Auth-User": f"CN=KEROUAC.JACK.A.0000000000,OU=USA,OU=PKI"}
        self.client = TestClient(router, headers=self.headers)
        self.clock = create_logical_clock(model=Unit.__name__)
        self.bn = create_testing_unit(uic="TF-000000")
        self.co_a = create_testing_unit(uic="TF-000001", echelon="CO", parent_unit=self.bn)
        self.co_b = create_testing_unit(uic="TF-000002", echelon="CO", parent_unit=self.bn)
        self.co_c = create_testing_unit(uic="TF-000003", echelon="CO", parent_unit=self.bn)
        self.plt_1 = create_testing_unit(uic="TF-000004", echelon="PLT", parent_unit=self.co_c)
        # Legacy Unit structure
        self.legacy_unit = create_single_test_unit()
        self.user = create_test_user(unit=self.legacy_unit)
        self.d_co_data = {
            "display_name": "Delta Company",
            "short_name": "D CO",
            "echelon": "CO",
            "parent_uic": "TF-000000",
            "start_date": "2024-11-21",
            "end_date": "2024-12-21",
        }

    def set_unit_lists(self):
        self.bn.set_all_unit_lists()
        self.co_c.set_all_unit_lists()
        self.plt_1.set_all_unit_lists()

    def test_create_unit(self):
        initial_time = self.clock.current_time
        initial_unit_count = Unit.objects.count()
        res = self.client.post("", body=json.dumps(self.d_co_data))
        new_unit_data: dict = res.json()
        # New unit returned
        for attr, value in self.d_co_data.items():
            # name difference between the API schemas
            if attr == "parent_uic":
                attr = "parent_unit"
            self.assertEqual(new_unit_data.get(attr), value, f"{attr} did not match")
        # One more unit should now exist
        self.assertGreater(Unit.objects.count(), initial_unit_count)
        # current clock time should be greater than the initial time
        self.clock.refresh_from_db()
        self.assertGreater(self.clock.current_time, initial_time)
        # Two units (D CO, and BN) should have new information
        self.assertEqual(Unit.objects.filter(as_of_logical_time=self.clock.current_time).count(), 2)

    def test_create_unit_invalid_parent(self):
        initial_time = self.clock.current_time
        initial_unit_count = Unit.objects.count()
        self.d_co_data["parent_uic"] = "INVALID"
        res = self.client.post("", body=json.dumps(self.d_co_data))
        # No unit returned
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)
        # No new units should exist
        self.assertEqual(Unit.objects.count(), initial_unit_count)
        # current clock time should be equal to the initial time
        self.clock.refresh_from_db()
        self.assertEqual(self.clock.current_time, initial_time)

    def test_list_units(self):
        res = self.client.get("")
        self.assertEqual(len(res.json()), Unit.objects.count())

    def test_list_units_invalid_top(self):
        res = self.client.get("?top_level_uic=INVALID")
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_list_units_valid_top(self):
        self.set_unit_lists()
        res = self.client.get(f"?top_level_uic={self.co_c.uic}")
        self.assertEqual(len(res.json()), 2)

    def test_list_units_filter_level(self):
        res = self.client.get("?level=1")
        self.assertEqual(len(res.json()), 3)

    def test_list_units_filter_uic(self):
        res = self.client.get("?uic=TF")
        self.assertEqual(len(res.json()), 5)

    def test_read_unit(self):
        res = self.client.get(f"/{self.co_a.uic}")
        self.assertEqual(res.json()["uic"], self.co_a.uic)

    def test_read_invalid_unit(self):
        res = self.client.get("/INVALID")
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_update_invalid_unit(self):
        new_parent_uic = {"parent_uic": "INVALID"}
        res = self.client.put("/INVALID", body=json.dumps(new_parent_uic))
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_update_invalid_parent_uic(self):
        new_parent_uic = {"parent_uic": "INVALID"}
        res = self.client.put(f"/{self.co_b}", body=json.dumps(new_parent_uic))
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_update_unit_name(self):
        initial_time = self.clock.current_time
        new_name = {"nick_name": "Bloodhounds"}
        res = self.client.put(f"/{self.co_b.uic}", body=json.dumps(new_name))
        self.assertEqual(res.json()["nick_name"], new_name["nick_name"])
        # current clock time should be greater than the initial time
        self.clock.refresh_from_db()
        self.assertGreater(self.clock.current_time, initial_time)
        # B CO should have the new clock time as its time
        self.co_b.refresh_from_db()
        self.assertEqual(self.co_b.as_of_logical_time, self.clock.current_time)

    def test_update_parent(self):
        initial_time = self.clock.current_time
        new_parent_uic = {"parent_uic": self.co_a.uic}
        res = self.client.put(f"/{self.co_b.uic}", body=json.dumps(new_parent_uic))
        self.assertEqual(res.json()["parent_unit"], self.co_a.uic)
        # current clock time should be greater than the initial time
        self.clock.refresh_from_db()
        self.assertGreater(self.clock.current_time, initial_time)
        # B CO, A CO, and BN should have the new clock time as their time
        self.co_b.refresh_from_db()
        self.assertEqual(self.co_b.as_of_logical_time, self.clock.current_time)
        self.co_a.refresh_from_db()
        self.assertEqual(self.co_a.as_of_logical_time, self.clock.current_time)
        self.bn.refresh_from_db()
        self.assertEqual(self.bn.as_of_logical_time, self.clock.current_time)

    def test_delete_unit(self):
        """
        We have not yet implemented the ability to delete a unit once created,
        if we implement it, add the appropriate tests here
        """
        res = self.client.delete(f"/{self.co_c.uic}")
        self.assertEqual(res.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
