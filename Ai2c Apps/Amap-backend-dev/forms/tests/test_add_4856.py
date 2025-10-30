from datetime import date
from unittest.mock import patch

from django.http import Http404, HttpRequest
from django.test import TestCase
from ninja import Form

from forms.api.counselings.routes import add_4856
from forms.api.counselings.schema import DA4856In
from forms.models import DA_4856
from personnel.model_utils import MaintenanceLevel, Rank
from utils.tests import create_single_test_event, create_test_4856_pdf, create_test_soldier, create_testing_unit


class Add4856Test(TestCase):
    # Initial setup for the add 4856 endpoint functionality
    def setUp(self):
        # Create test unit
        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")

        # Create test soldiers
        self.soldier = create_test_soldier(
            unit=self.unit, user_id="1234567890", rank=Rank.SPC, first_name="John", last_name="Doe"
        )

        self.evaluator = create_test_soldier(
            unit=self.unit, user_id="0101010101", rank=Rank.SSG, first_name="Test", last_name="Evaluator"
        )

        self.uploading_soldier = create_test_soldier(
            unit=self.unit, user_id="9999999999", rank=Rank.SGT, first_name="Test", last_name="Uploader"
        )

        # Create test event (DA 7817)
        self.da7817 = create_single_test_event(
            soldier=self.soldier, recorded_by=self.evaluator, uic=self.unit, maintenance_level=MaintenanceLevel.ML2
        )

        # Set up test data
        self.form_title = "PFC_Snuffy_Evaluation_Counseling_04DEC2021"
        self.date = date(2021, 12, 4)
        self.date_str = self.date.isoformat()  # Convert to string format
        self.pdf_counseling = create_test_4856_pdf()

    @patch("utils.http.user_id.get_user_string")
    def test_invalid_soldier(self, mock_get_user_string):
        """
        Checks that a request to add a 4856 with an invalid soldier id passed in the url fails
        """
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Create a request object
        request = HttpRequest()
        request.method = "POST"
        request.FILES = {"pdf": self.pdf_counseling}

        # Call the function directly and expect a 404 for invalid soldier
        with self.assertRaises(Http404) as context:
            add_4856(
                request=request,
                soldier_id="INVALID",
                data={"title": self.form_title, "date": self.date_str, "associated_event_id": None},
                pdf=self.pdf_counseling,
            )

        # Check for the specific 404 error message
        self.assertIn("No Soldier matches the given query.", str(context.exception))

        # Verify no counseling was created
        self.assertEqual(DA_4856.objects.filter(soldier__user_id="INVALID").count(), 0)

    @patch("utils.http.user_id.get_user_string")
    def test_add_4856_without_7817(self, mock_get_user_string):
        """
        Checks a valid request to add a 4856 without an associated 7817
        """
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Create a request object
        request = HttpRequest()
        request.method = "POST"
        request.FILES = {"pdf": self.pdf_counseling}

        request_data = DA4856In(title=self.form_title, date=self.date_str, assocaited_event_id=None)

        # Call the function directly
        response = add_4856(
            request=request,
            soldier_id=self.soldier.user_id,
            data=request_data,
            pdf=self.pdf_counseling,
        )

        # Verify the counseling was created
        counselings = DA_4856.objects.filter(soldier=self.soldier)
        self.assertEqual(counselings.count(), 1)
        self.assertEqual(counselings.first().title, self.form_title)
        self.assertEqual(counselings.first().date, self.date)
        self.assertEqual(counselings.first().uploaded_by, self.uploading_soldier)

    @patch("utils.http.user_id.get_user_string")
    def test_add_4856_with_7817(self, mock_get_user_string):
        """
        Checks a valid request to add a 4856 with a valid associated 7817
        """
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Create a request object
        request = HttpRequest()
        request.method = "POST"
        request.FILES = {"pdf": self.pdf_counseling}

        request_data = DA4856In(title=self.form_title, date=self.date_str, assocaited_event_id=self.da7817.id)

        # Call the function directly
        response = add_4856(
            request=request,
            soldier_id=self.soldier.user_id,
            data=request_data,
            pdf=self.pdf_counseling,
        )

        # Verify the counseling was created
        counseling = DA_4856.objects.filter(soldier=self.soldier).first()
        self.da7817.refresh_from_db()

        # Verify the counseling was attached to the 7817 form
        self.assertEqual(self.da7817.attached_da_4856, counseling)
        self.assertEqual(counseling.title, self.form_title)
        self.assertEqual(counseling.date, self.date)
        self.assertEqual(counseling.uploaded_by, self.uploading_soldier)

    @patch("utils.http.user_id.get_user_string")
    def test_add_4856_with_invalid_7817(self, mock_get_user_string):
        """
        Checks a valid request to add a 4856 with an invalid 7817 ID
        """
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Create a request object
        request = HttpRequest()
        request.method = "POST"
        request.FILES = {"pdf": self.pdf_counseling}

        request_data = DA4856In(title=self.form_title, date=self.date_str, assocaited_event_id="051198")

        # First it finds the soldier but then can't find the event
        with self.assertRaises(Http404) as context:
            add_4856(
                request=request,
                soldier_id=self.soldier.user_id,
                data=request_data,
                pdf=self.pdf_counseling,
            )

        # Check for the specific 404 error message about the event not existing
        self.assertIn("No Event matches the given query.", str(context.exception))
