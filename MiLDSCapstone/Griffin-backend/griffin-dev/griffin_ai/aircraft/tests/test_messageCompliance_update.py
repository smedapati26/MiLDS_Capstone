from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from aircraft.models import MessageCompliance
from aircraft.model_utils import MessageComplianceStatuses

from utils.tests import (
    create_test_units,
    get_default_top_unit,
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_single_test_message_compliance,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST


@tag("aircraft", "message_compliance", "update")
class MessageComplianceUpdateTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.unit)

        self.message = create_single_test_aircraft_message()

        self.message_compliance = create_single_test_message_compliance(message=self.message, aircraft=self.aircraft)

    def test_update_message_compliance_with_invalid_message_compliance_id(self):
        # Setup the update data
        update_message_compliance_data = {
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "2022-07-15",
        }

        # Store existing data
        pre_update_values = list(
            MessageCompliance.objects.filter(id=self.message_compliance.id).values(
                *update_message_compliance_data.keys()
            )
        )[0]

        # Make the API Call
        resp = self.client.put(
            reverse("update_message_compliance", kwargs={"message_id": self.message_compliance.id + 51198}),
            data=update_message_compliance_data,
            content_type="application/json",
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

        # Verify no updates to data
        self.message_compliance.refresh_from_db()
        post_update_values = list(
            MessageCompliance.objects.filter(id=self.message_compliance.id).values(
                *update_message_compliance_data.keys()
            )
        )[0]

        self.assertCountEqual(pre_update_values, post_update_values)

    def test_update_message_compliance_with_valid_empty_partial_update_data(self):
        # Setup the update data
        update_message_compliance_data = {}

        # Store existing data
        pre_update_values = list(MessageCompliance.objects.filter(id=self.message_compliance.id).values())[0]

        # Make the API Call
        resp = self.client.put(
            reverse("update_message_compliance", kwargs={"message_id": self.message_compliance.id}),
            data=update_message_compliance_data,
            content_type="application/json",
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Message Compliance successfully updated.")

        # Verify no updates to data
        self.message_compliance.refresh_from_db()
        post_update_values = list(MessageCompliance.objects.filter(id=self.message_compliance.id).values())[0]

        self.assertCountEqual(pre_update_values, post_update_values)

    def test_update_message_compliance_with_valid_full_update_data(self):
        # Setup the update data
        update_message_compliance_data = {
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "2022-07-15",
            "status": MessageComplianceStatuses.INIT_PASS,
        }

        # Make the API Call
        resp = self.client.put(
            reverse("update_message_compliance", kwargs={"message_id": self.message_compliance.id}),
            data=update_message_compliance_data,
            content_type="application/json",
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Message Compliance successfully updated.")

        # Verify no updates to data
        self.message_compliance.refresh_from_db()
        post_update_values = list(
            MessageCompliance.objects.filter(id=self.message_compliance.id).values(
                *update_message_compliance_data.keys()
            )
        )[0]

        self.assertCountEqual(post_update_values, update_message_compliance_data)
