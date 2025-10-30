import xml.etree.ElementTree as et

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_400_XML_MISSING_REQUIRED_FIELDS, HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.tests import create_test_7817_xml, create_test_soldier, create_testing_unit


@tag("forms", "shiny_ingest_7817_xml")
class Ingest7817XmlTest(TestCase):
    xml_content = "application/xml"

    # Initial setup for the ingest 7817 endpoint functionality
    def setUp(self) -> None:
        # Create example xml file
        self.best_wrench_xml = create_test_7817_xml()
        # Create Unit
        self.test_unit = create_testing_unit()
        # Create Soldier
        self.test_user = create_test_soldier(unit=self.test_unit)

    @tag("validation")
    def test_ingest_7817_with_valid_soldier(self):
        url = reverse("shiny_ingest_7817_xml", kwargs={"dod_id": self.test_user.user_id})
        response = self.client.post(url, data=self.best_wrench_xml, content_type=self.xml_content)
        self.assertEqual(response.status_code, 200)

    @tag("validation")
    def test_ingest_7817_with_invalid_soldier(self):
        url = reverse("shiny_ingest_7817_xml", kwargs={"dod_id": "0"})
        response = self.client.post(url, data=self.best_wrench_xml, content_type=self.xml_content)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_ingest_7817_with_missing_required_fields(self):
        root = et.fromstring(self.best_wrench_xml)
        rank1 = root.find(".//Rank1")
        if rank1 is not None:
            root.remove(rank1)
        new_xml = et.tostring(root, encoding="utf-8")
        url = reverse("shiny_ingest_7817_xml", kwargs={"dod_id": self.test_user.user_id})
        response = self.client.post(url, data=new_xml, content_type=self.xml_content)
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.content.decode("utf-8"), HTTP_400_XML_MISSING_REQUIRED_FIELDS)

    @tag("soldier_info")
    def test_ingest_7817_soldier_info(self):
        url = reverse("shiny_ingest_7817_xml", kwargs={"dod_id": self.test_user.user_id})
        response = self.client.post(url, data=self.best_wrench_xml, content_type=self.xml_content)

        # Get soldier info json
        soldier_info = response.json()["Soldier_info"]
        self.assertEqual(soldier_info[0]["PV2"], "20160525")
        self.assertEqual(soldier_info[0]["PFC"], "20161010")
        self.assertEqual(soldier_info[0]["SPC"], "20190201")
        self.assertEqual(soldier_info[0]["SGT"], "20211201")
        self.assertEqual(soldier_info[0]["SSG"], "20230909")
        self.assertEqual(soldier_info[0]["SFC"], "20250228")
        self.assertEqual(soldier_info[0]["ML"], "ML4")
        self.assertEqual(soldier_info[0]["DOD_ID"], "1234567890")

    @tag("da7817_records")
    def test_ingest_7817_records(self):
        url = reverse("shiny_ingest_7817_xml", kwargs={"dod_id": self.test_user.user_id})
        response = self.client.post(url, data=self.best_wrench_xml, content_type=self.xml_content)

        # Get soldier records json
        soldier_records = response.json()["Soldier_records"]
        # Check first record
        self.assertEqual(soldier_records[0]["event_date"], "20171002")
        self.assertEqual(
            soldier_records[0]["event_remarks"],
            "Completed 15R AIT (see comment) (Additional Remarks) -> Honor graduate 15R course 16-03",
        )
        self.assertEqual(soldier_records[0]["go_nogo"], "N/A")
        self.assertEqual(soldier_records[0]["recorded_by_legacy"], "SSG Aldridge")
        self.assertEqual(soldier_records[0]["soldier_initials"], "BDW")
        self.assertEqual(soldier_records[0]["maintenance_level"], "ML0")
        self.assertEqual(soldier_records[0]["uic"], "TEST000AA")
        self.assertEqual(soldier_records[0]["event_type"], "Training")
        self.assertEqual(soldier_records[0]["training_type"], "Other")
        self.assertEqual(soldier_records[0]["evaluation_type"], None)
        self.assertEqual(soldier_records[0]["award_type"], None)
        self.assertEqual(soldier_records[0]["gaining_unit"], None)
        self.assertEqual(soldier_records[0]["total_mx_hours"], None)
