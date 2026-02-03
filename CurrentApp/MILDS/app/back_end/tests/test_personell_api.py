# app/back_end/tests/test_personnel_api.py
import json
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

    def test_personnel_detail_ok(self):
        url = reverse("personnel-detail", kwargs={"pk": self.s1.user_id})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertEqual(data["user_id"], "123456789012")
        self.assertEqual(data["rank"], "CPT")

    def test_personnel_patch_updates_fields_and_parses_boolean(self):
        url = reverse("personnel-detail", kwargs={"pk": self.s1.user_id})
        payload = {"current_unit": "WDDRA0", "is_maintainer": "true"}

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 200)

        self.s1.refresh_from_db()
        self.assertEqual(self.s1.current_unit, "WDDRA0")
        self.assertTrue(self.s1.is_maintainer)

    def test_personnel_patch_invalid_boolean_returns_400(self):
        url = reverse("personnel-detail", kwargs={"pk": self.s1.user_id})
        payload = {"is_maintainer": "maybe"}

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("boolean", resp.json().get("detail", ""))

    def test_personnel_patch_only_invalid_fields_returns_200_current_object(self):
        """
        Your view returns current object if no valid fields were provided (better UX than 400).
        """
        url = reverse("personnel-detail", kwargs={"pk": self.s1.user_id})
        payload = {"not_real": "x"}

        resp = self.client.patch(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["user_id"], self.s1.user_id)
