# app/back_end/tests/test_personnel_api.py
from django.test import TestCase
from django.urls import reverse
from app.back_end.models import Soldier


class PersonnelApiTests(TestCase):
    def setUp(self):
        self.s1 = Soldier.objects.create(
            user_id="123456789012",
            rank="CPT",
            first_name="Jane",
            last_name="Doe",
            primary_mos="17A",
            current_unit="75 RR",
            is_maintainer=False,
        )

    def test_personnel_list_returns_expected_fields(self):
        """
        /api/personnel/ should return JSON array with soldier details
        that the frontend uses.
        """
        url = reverse("personnel-list")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

        first = data[0]
        for field in [
            "user_id",
            "rank",
            "first_name",
            "last_name",
            "primary_mos",
            "current_unit",
            "is_maintainer",
        ]:
            self.assertIn(field, first)
