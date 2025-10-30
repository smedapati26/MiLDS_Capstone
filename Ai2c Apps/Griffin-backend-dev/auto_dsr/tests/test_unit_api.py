import json
from http import HTTPStatus

from django.test import TestCase
from ninja.testing import TestClient

from auto_dsr.api.routes import auto_dsr_router as router
from auto_dsr.models import Unit
from utils.tests import create_test_units, create_test_user


class DSRUnitApiTest(TestCase):
    def setUp(self):
        self.units, _ = create_test_units()
        # Legacy Unit structure
        self.user = create_test_user(unit=self.units[0], is_admin=True)
        self.client = TestClient(router, headers={"Auth-User": self.user.user_id})

    def test_list_units(self):
        res = self.client.get("/unit")
        self.assertEqual(len(res.json()), Unit.objects.count())

    def test_list_units_filter_level(self):
        res = self.client.get("/unit?level=1")
        self.assertEqual(len(res.json()), 3)

    def test_list_units_filter_uic(self):
        res = self.client.get(f"/unit?uic={self.units[1].uic}")
        self.assertEqual(len(res.json()), 1)

    def test_list_units_invalid_top(self):
        res = self.client.get("/unit?top_level_uic=INVALID")
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_list_units_valid_top(self):
        res = self.client.get(f"/unit?top_level_uic={self.units[0].uic}")
        self.assertEqual(len(res.json()), 13)
        res = self.client.get(f"/unit?top_level_uic={self.units[1].uic}")
        self.assertEqual(len(res.json()), 4)

    def test_read_unit(self):
        res = self.client.get(f"/unit/{self.units[0].uic}")
        self.assertEqual(res.json()["uic"], self.units[0].uic)

    def test_read_invalid_unit(self):
        res = self.client.get("/unit/INVALID")
        self.assertEqual(res.status_code, HTTPStatus.NOT_FOUND)

    def test_sub_units(self):
        res = self.client.get(f"/subordinate-units?uic={self.units[0].uic}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.data,
            [
                {
                    "uic": "TEST000AA",
                    "short_name": "1-100 TEST",
                    "display_name": "1st Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "BN",
                    "parent_uic": "TSUNFF",
                    "level": 1,
                    "similar_units": [],
                },
                {
                    "uic": "TEST001AA",
                    "short_name": "2-100 TEST",
                    "display_name": "2nd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "BN",
                    "parent_uic": "TSUNFF",
                    "level": 1,
                    "similar_units": [],
                },
                {
                    "uic": "TEST002AA",
                    "short_name": "3-100 TEST",
                    "display_name": "3rd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "BN",
                    "parent_uic": "TSUNFF",
                    "level": 1,
                    "similar_units": [],
                },
            ],
        )

    def test_sub_units_level_down(self):
        res = self.client.get(f"/subordinate-units?uic={self.units[0].uic}&level_down=2")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.data,
            [
                {
                    "uic": "TEST000A0",
                    "short_name": "A CO, 1-100 TEST",
                    "display_name": "Alpha Company, 1st Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST000AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST000B0",
                    "short_name": "B CO, 1-100 TEST",
                    "display_name": "Bravo Company, 1st Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST000AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST000C0",
                    "short_name": "C CO, 1-100 TEST",
                    "display_name": "Charlie Company, 1st Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST000AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST001A0",
                    "short_name": "A CO, 2-100 TEST",
                    "display_name": "Alpha Company, 2nd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST001AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST001B0",
                    "short_name": "B CO, 2-100 TEST",
                    "display_name": "Bravo Company, 2nd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST001AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST001C0",
                    "short_name": "C CO, 2-100 TEST",
                    "display_name": "Charlie Company, 2nd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST001AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST002A0",
                    "short_name": "A CO, 3-100 TEST",
                    "display_name": "Alpha Company, 3rd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST002AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST002B0",
                    "short_name": "B CO, 3-100 TEST",
                    "display_name": "Bravo Company, 3rd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST002AA",
                    "level": 2,
                    "similar_units": [],
                },
                {
                    "uic": "TEST002C0",
                    "short_name": "C CO, 3-100 TEST",
                    "display_name": "Charlie Company, 3rd Battalion, 100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "CO",
                    "parent_uic": "TEST002AA",
                    "level": 2,
                    "similar_units": [],
                },
            ],
        )

    def test_sub_units_level_down_empty(self):
        res = self.client.get(f"/subordinate-units?uic={self.units[0].uic}&level_down=3")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data, [])

    def test_level_down(self):
        units = Unit.objects.get(uic=self.units[0].uic).subordinate_unit_hierarchy(include_self=False, level_down=1)
        self.assertEqual(units, ["TEST000AA", "TEST001AA", "TEST002AA"])
        units = Unit.objects.get(uic=self.units[0].uic).subordinate_unit_hierarchy(include_self=False, level_down=2)
        self.assertEqual(
            units,
            [
                "TEST000A0",
                "TEST000B0",
                "TEST000C0",
                "TEST001A0",
                "TEST001B0",
                "TEST001C0",
                "TEST002A0",
                "TEST002B0",
                "TEST002C0",
            ],
        )
        units = Unit.objects.get(uic=self.units[0].uic).subordinate_unit_hierarchy(
            include_self=False, level_down=2, only_level=False
        )
        self.assertEqual(
            units,
            [
                "TEST000AA",
                "TEST001AA",
                "TEST002AA",
                "TEST000A0",
                "TEST000B0",
                "TEST000C0",
                "TEST001A0",
                "TEST001B0",
                "TEST001C0",
                "TEST002A0",
                "TEST002B0",
                "TEST002C0",
            ],
        )
