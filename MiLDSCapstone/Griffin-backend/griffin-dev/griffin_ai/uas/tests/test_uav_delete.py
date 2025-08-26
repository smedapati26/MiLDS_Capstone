from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from uas.models import UAV, UnitUAV
from utils.tests import (
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
    create_test_location,
    create_single_test_uav,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST


@tag("uas", "delete", "uav")
class TestUAVViews(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.location = create_test_location()

        self.uav = create_single_test_uav(self.top_unit)

    def test_delete_with_invalid_uav_serial(self):
        response = self.client.delete(
            reverse("delete_uav", kwargs={"uav_id": 99 + self.uav.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

        self.assertEqual(UAV.objects.count(), 1)
        self.assertEqual(UnitUAV.objects.count(), 1)

    def test_delete_with_valid_uav(self):
        response = self.client.delete(
            reverse("delete_uav", kwargs={"uav_id": self.uav.id}),
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "UAV successfully deleted.")

        self.assertEqual(UAV.objects.count(), 0)
        self.assertEqual(UnitUAV.objects.count(), 0)
