from datetime import datetime
from http import HTTPStatus

from django.test import TestCase, tag
from ninja.testing import TestClient

from auto_dsr.models import Unit, User
from units.api.favorite_unit.routes import router
from units.models import FavoriteUnit
from utils.tests import create_single_test_unit, create_test_user


class FavoriteUnitsAPI(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()
        self.unit2 = create_single_test_unit(short_name="Test 2", display_name="Test 2", uic="XX-12347")

        self.user = create_test_user(self.unit)
        self.client = TestClient(router, headers={"Auth-User": self.user.user_id})

    def test_get_favorites(self):
        # create dummy favorites
        self.favorite_unit1 = FavoriteUnit.objects.create(user_id=self.user, unit=self.unit)
        self.favorite_unit2 = FavoriteUnit.objects.create(user_id=self.user, unit=self.unit2)

        response = self.client.get("0000000000")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_remove_favorite(self):
        # create dummy favorites
        self.favorite_unit1 = FavoriteUnit.objects.create(user_id=self.user, unit=self.unit)
        self.favorite_unit2 = FavoriteUnit.objects.create(user_id=self.user, unit=self.unit2)

        response = self.client.delete(
            "0000000000", json={"uics": [self.unit.uic]}, headers={"Auth-User": self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(FavoriteUnit.objects.all()), 1)

    def test_add_favorite(self):
        response = self.client.post(
            "0000000000", json={"uics": [self.unit.uic]}, headers={"Auth-User": self.user.user_id}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(FavoriteUnit.objects.all()), 1)

    def test_unauthorized_user(self):
        self.favorite_unit1 = FavoriteUnit.objects.create(user_id=self.user, unit=self.unit)

        # create another user
        create_test_user(self.unit, user_id="0000000001")
        invalid_user = User.objects.get(user_id="0000000001")

        # make the invalid user do the request
        response = self.client.delete(
            "0000000000", json={"uics": [self.unit.uic]}, headers={"Auth-User": invalid_user.user_id}
        )

        self.assertEqual(response.status_code, 401)
