from django.test import TestCase
from ninja.testing import TestClient

from personnel.models import MOSCode
from tasks.api.routes import router
from tasks.models import MOS, Ictl
from units.models import Unit
from utils.tests import create_test_ictl, create_test_mos, create_test_mos_code
from utils.tests.unit import create_testing_unit


class TestUCTLDuplicateCheck(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit(uic="W12345")

        self.mos_15r = create_test_mos_code(mos="15R")
        self.mos_obj_15r = create_test_mos(mos_code="15R")

        self.uctl1 = create_test_ictl(
            ictl_id=1,
            ictl_title="82nd CAB Maintenance Training",
            proponent="UNIT",
            unit=self.unit,
            status="Approved",
            skill_level="SL1",
        )
        self.uctl1.mos.add(self.mos_obj_15r)

        self.uctl2 = create_test_ictl(
            ictl_id=2,
            ictl_title="82nd CAB Advanced Maintenance",
            proponent="UNIT",
            unit=self.unit,
            status="Approved",
            skill_level="SL2",
        )
        self.uctl2.mos.add(self.mos_obj_15r)

        self.ictl = create_test_ictl(
            ictl_id=3, ictl_title="USAACE Standard Training", proponent="USAACE", status="Approved"
        )
        self.ictl.mos.add(self.mos_obj_15r)

    def test_exact_match(self):
        """Test finding exact match"""
        response = self.client.get("/uctls/check_duplicate?proposed_title=82nd CAB Maintenance Training")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["matches"]), 2)
        self.assertEqual(data["matches"][0]["title"], "82nd CAB Maintenance Training")
        self.assertEqual(data["matches"][0]["similarity_score"], 100.0)
        self.assertEqual(data["matches"][0]["ictl_id"], 1)

    def test_partial_match(self):
        """Test finding partial matches"""
        response = self.client.get("/uctls/check_duplicate?proposed_title=82nd CAB")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["matches"]), 2)

        titles = [match["title"] for match in data["matches"]]
        self.assertIn("82nd CAB Maintenance Training", titles)
        self.assertIn("82nd CAB Advanced Maintenance", titles)

    def test_no_matches(self):
        """Test when no matches are found"""
        response = self.client.get("/uctls/check_duplicate?proposed_title=SOMETHING")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["matches"]), 0)

    def test_empty_database(self):
        """Test behavior when no UCTLs exist"""
        Ictl.objects.exclude(proponent="USAACE").delete()

        response = self.client.get("/uctls/check_duplicate?proposed_title=82nd CAB Maintenance Training")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["matches"]), 0)
