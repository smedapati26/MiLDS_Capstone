from django.test import TestCase, tag
from django.urls import reverse
import xml.etree.ElementTree as et
import datetime
import zipfile
import io

from forms.model_utils import EventType as OldEventType

from utils.tests import (
    create_test_soldier,
    create_test_unit,
    create_single_test_event,
    create_test_event_type,
    create_test_training_type,
    create_test_award_type,
)
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@tag("forms", "shiny_export_7817_xml")
class Export7817XmlTest(TestCase):
    xml_content = "application/xml"

    # Initial setup for the export 7817 endpoint functionality
    def setUp(self) -> None:
        self.unit = create_test_unit()
        self.gaining_unit = create_test_unit("TEST000AB")
        self.soldier = create_test_soldier(unit=self.unit)
        self.evaluator = create_test_soldier(unit=self.unit, user_id="0101010101", last_name="Evaluator")
        self.test_eval = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            date_time=datetime.date(2023, 1, 1),
        )
        self.test_legacy_train = create_single_test_event(
            soldier=self.soldier,
            recorded_by=None,
            uic=self.unit,
            id=2,
            date_time=datetime.date(2023, 1, 2),
            event_type=create_test_event_type(event_type=OldEventType.Training.value),
            training_type=create_test_training_type(training_type="Corrosion Monitor"),
            comment="",
        )
        self.test_award = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=3,
            date_time=datetime.date(2023, 1, 3),
            event_type=create_test_event_type(event_type=OldEventType.Award.value),
            award_type=create_test_award_type(award_type="Bronze Star"),
            comment="",
        )
        self.test_other = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=4,
            date_time=datetime.date(2023, 1, 4),
            event_type=create_test_event_type(event_type=OldEventType.Other.value),
            comment="",
        )
        self.test_pcs = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=5,
            date_time=datetime.date(2023, 1, 5),
            event_type=create_test_event_type(event_type=OldEventType.PCSorETS.value),
            gaining_unit=self.gaining_unit,
            comment="",
        )
        self.test_record_review = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=6,
            date_time=datetime.date(2023, 1, 6),
            event_type=create_test_event_type(OldEventType.RecordsReview.value),
            comment="",
        )
        self.test_eval_no_cmmnt = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=7,
            date_time=datetime.date(2023, 1, 7),
            comment="",
        )
        self.test_in_unit_transfer = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=8,
            date_time=datetime.date(2023, 1, 8),
            event_type=create_test_event_type(event_type=OldEventType.InUnitTransfer.value),
            gaining_unit=self.gaining_unit,
            comment="",
        )
        self.test_lao = create_single_test_event(
            soldier=self.soldier,
            recorded_by=self.evaluator,
            uic=self.unit,
            id=9,
            date_time=datetime.date(2023, 1, 9),
            event_type=create_test_event_type(event_type=OldEventType.LAO.value),
            comment="",
        )

    @tag("test_export_invalid_soldier")
    def test_export_7817_invalid_soldier(self):
        """
        Checks that a request to export 7817 data with an invalid soldier id returns a not found error
        """
        url = reverse("shiny_export_7817_xml", kwargs={"dod_id": "INVALID"})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("test_export_returned_xml")
    def test_export_7817_returned_xml(self):
        """
        Checks that a request to export 7817 data with an invalid soldier id returns a not found error
        """
        url = reverse("shiny_export_7817_xml", kwargs={"dod_id": self.soldier.user_id})

        response = self.client.get(url)

        zip_file = zipfile.ZipFile(io.BytesIO(b"".join(response.streaming_content)))
        file_to_check = "Test_User_DA7817_Data_Page_1.xml"
        xml_content = zip_file.read(file_to_check).decode("utf-8")
        root = et.fromstring(xml_content)

        # Check response and zip file content
        self.assertEqual(response.status_code, 200)
        self.assertIn(file_to_check, zip_file.namelist())
        # Check soldier info section of 7817 XML
        self.assertEqual(root.find(".//Rank1").text, "PV2")
        self.assertEqual(root.find(".//Rank2").text, "PFC")
        self.assertEqual(root.find(".//Rank3").text, "SPC")
        self.assertEqual(root.find(".//Rank4").text, "SGT")
        self.assertEqual(root.find(".//Rank5").text, "SSG")
        self.assertEqual(root.find(".//Rank6").text, "SFC")
        self.assertEqual(root.find(".//Date_Rank1").text, "2018-10-01")
        self.assertEqual(root.find(".//Date_Rank2").text, "2019-10-01")
        self.assertEqual(root.find(".//Date_Rank3").text, "2020-10-01")
        self.assertEqual(root.find(".//Date_Rank4").text, "2021-10-01")
        self.assertEqual(root.find(".//Date_Rank5").text, "2022-10-01")
        self.assertEqual(root.find(".//Date_Rank6").text, "2023-10-01")
        self.assertEqual(root.findall(".//MOS")[0].text, "15T")
        self.assertEqual(root.findall(".//MOS")[1].text, "1234567890")
        # Check soldier event records section of 7817 XML
        self.assertEqual(root.find(".//Date1").text, "2023-01-01")
        self.assertEqual(root.find(".//Event1").text, "A-MAP | [Evaluation - Annual] TST_COMMENTS")
        self.assertEqual(root.find(".//Recorded_By1").text, "SFC Test Evaluator")
        self.assertEqual(root.find(".//Initials1").text, "TU")
        self.assertEqual(root.find(".//group1").text, "1")
        # Check legacy record (record #2) recorded by field displays correctly
        self.assertEqual(root.find(".//Date2").text, "2023-01-02")
        self.assertEqual(root.find(".//Recorded_By2").text, "SGT John Wayne")
        self.assertEqual(root.find(".//Event2").text, "A-MAP | [Training - Corrosion Monitor] ")
        # Check Award Event Comments
        self.assertEqual(root.find(".//Event3").text, "A-MAP | [Award - Bronze Star] ")
        # Check Other Event Comments
        self.assertEqual(root.find(".//Event4").text, "A-MAP | [Other] ")
        # Check Award Event Comments
        self.assertEqual(root.find(".//Event5").text, "A-MAP | [PCS/ETS - Gaining Unit - 1-100 TEST] ")
        # Check Award Event Comments
        self.assertEqual(root.find(".//Event6").text, "A-MAP | [Records Review] ")
        # Check Eval Event Comments
        self.assertEqual(root.find(".//Event7").text, "A-MAP | [Evaluation - Annual] ")
        # Check In-Unit Transfer Event Comments
        self.assertEqual(root.find(".//Event8").text, "A-MAP | [In-Unit Transfer - Gaining Unit - 1-100 TEST] ")
        # Check LAO Event Comments
        self.assertEqual(root.find(".//Event9").text, "A-MAP | [Local Area Orientation] ")
