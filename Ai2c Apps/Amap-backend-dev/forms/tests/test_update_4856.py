import json
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.counselings.routes import router
from utils.tests import (
    create_single_test_event,
    create_test_4856,
    create_test_4856_pdf,
    create_test_soldier,
    create_testing_unit,
)


@tag("forms", "DA_4856", "update", "zz")
class UpdateDA4856Tests(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.uploading_soldier = create_test_soldier(unit=self.unit, user_id="9999999999", last_name="Uploader")
        da_4856_pdf = create_test_4856_pdf()
        self.da_4856 = create_test_4856(soldier=self.soldier, document=da_4856_pdf)
        self.event = create_single_test_event(soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit)
        self.request_data = {
            "date": "1998-05-11",
            "title": "New 4856 Title",
            "associate_event": "True",
            "event": str(self.event.id),
        }
        self.success_response = '"DA 4856 successfully updated."'

    @patch("utils.http.user_id.get_user_string")
    def test_invalid_4856_id(self, mock_get_user_string):
        # Mock the certificate string with the uploading soldier's ID
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        resp = self.client.put(f"/{51198}", json=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)

        # Assert data is updated as expected
        old_date = self.da_4856.date
        old_title = self.da_4856.title

        self.da_4856.refresh_from_db()

        new_date = self.da_4856.date
        new_title = self.da_4856.title

        self.assertEqual(new_date, old_date)
        self.assertEqual(new_title, old_title)

    @patch("utils.http.user_id.get_user_string")
    def test_valid_request_with_no_update_data(self, mock_get_user_string):
        # Mock the certificate string with the uploading soldier's ID
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        resp = self.client.put(f"/{self.da_4856.id}", json={})

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), self.success_response)

        # Assert data is updated as expected
        old_date = self.da_4856.date
        old_title = self.da_4856.title

        self.da_4856.refresh_from_db()

        new_date = self.da_4856.date
        new_title = self.da_4856.title

        self.assertEqual(new_date, old_date)
        self.assertEqual(new_title, old_title)

    @patch("utils.http.user_id.get_user_string")
    def test_valid_request_with_full_update_data(self, mock_get_user_string):
        # Mock the certificate string with the uploading soldier's ID
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        resp = self.client.put(f"/{self.da_4856.id}", json=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), self.success_response)

        # Assert data is updated as expected
        expected_date = self.request_data["date"]
        expected_title = self.request_data["title"]

        self.event.refresh_from_db()
        self.da_4856.refresh_from_db()

        actual_date = str(self.da_4856.date)
        actual_title = self.da_4856.title

        self.assertEqual(actual_date, expected_date)
        self.assertEqual(actual_title, expected_title)
        self.assertEqual(self.event.attached_da_4856.id, self.da_4856.id)

    @patch("utils.http.user_id.get_user_string")
    def test_event_and_associate_event_logic(self, mock_get_user_string):
        # Mock the certificate string with the uploading soldier's ID
        mock_user_string = f"CN=UPLOADER.TEST.A.{self.uploading_soldier.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Remove associate_event from request data and have an event already associted with the da_4856
        new_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.uploading_soldier, uic=self.unit, id=2
        )
        new_event.attached_da_4856 = self.da_4856
        new_event.save()

        self.event.attached_da_4856 = None
        self.event.save()

        no_assocaite_event_request_data = self.request_data.copy()
        no_assocaite_event_request_data.pop("associate_event")

        # Make the request
        resp = self.client.put(f"/{self.da_4856.id}", json=no_assocaite_event_request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), self.success_response)

        # Assert data is updated as expected
        expected_date = self.request_data["date"]
        expected_title = self.request_data["title"]

        new_event.refresh_from_db()
        self.event.refresh_from_db()
        self.da_4856.refresh_from_db()

        actual_date = str(self.da_4856.date)
        actual_title = self.da_4856.title

        self.assertEqual(actual_date, expected_date)
        self.assertEqual(actual_title, expected_title)
        self.assertEqual(new_event.attached_da_4856, None)
        self.assertEqual(self.event.attached_da_4856.id, self.da_4856.id)

        # Set associate_event to false and remove event
        remove_associate_event_request_data = self.request_data.copy()
        remove_associate_event_request_data["associate_event"] = "False"
        remove_associate_event_request_data.pop("event")

        # Make the request
        resp = self.client.put(f"/{self.da_4856.id}", json=remove_associate_event_request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), self.success_response)

        # Assert data is updated as expected
        expected_date = self.request_data["date"]
        expected_title = self.request_data["title"]

        self.event.refresh_from_db()
        self.da_4856.refresh_from_db()

        actual_date = str(self.da_4856.date)
        actual_title = self.da_4856.title

        self.assertEqual(actual_date, expected_date)
        self.assertEqual(actual_title, expected_title)
        self.assertEqual(self.event.attached_da_4856, None)

        # Test try and catch sections for non-existing events with attached da_4856.
        # Make the request
        resp = self.client.put(f"/{self.da_4856.id}", json=self.request_data)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), self.success_response)

        # Assert data is updated as expected
        expected_date = self.request_data["date"]
        expected_title = self.request_data["title"]

        self.event.refresh_from_db()
        self.da_4856.refresh_from_db()

        actual_date = str(self.da_4856.date)
        actual_title = self.da_4856.title

        self.assertEqual(actual_date, expected_date)
        self.assertEqual(actual_title, expected_title)
        self.assertEqual(self.event.attached_da_4856.id, self.da_4856.id)
