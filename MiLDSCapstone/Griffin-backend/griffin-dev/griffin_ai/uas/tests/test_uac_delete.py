from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from uas.models import UAC, UnitUAC
from utils.tests import (
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
    create_test_location,
    create_single_test_uac,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST


@tag("uas", "delete", "uac")
class UACDeleteTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uac = create_single_test_uac(self.top_unit)

    def test_delete_with_invalid_uac_serial(self):
        response = self.client.delete(
            reverse("delete_uac", kwargs={"uac_id": 99 + self.uac.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

        self.assertEqual(UAC.objects.count(), 1)
        self.assertEqual(UnitUAC.objects.count(), 1)

    def test_delete_with_valid_uac(self):
        response = self.client.delete(
            reverse("delete_uac", kwargs={"uac_id": self.uac.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "UAC successfully deleted.")

        self.assertEqual(UAC.objects.count(), 0)
        self.assertEqual(UnitUAC.objects.count(), 0)
