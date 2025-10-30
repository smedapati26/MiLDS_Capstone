from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import DA_4856
from utils.http.constants import HTTP_404_DA4856_DOES_NOT_EXIST
from utils.tests import create_test_4856, create_test_4856_pdf, create_test_soldier, create_testing_unit


@tag("forms", "DA_4856", "delete")
class ShinyDeleteDA4856Tests(TestCase):
    def setUp(self):
        self.unit = create_testing_unit()

        self.soldier = create_test_soldier(unit=self.unit)

        da_4856_pdf = create_test_4856_pdf()

        self.da_4856 = create_test_4856(soldier=self.soldier, document=da_4856_pdf)

    def test_invalid_4856_id(self):
        # Make the request
        resp = self.client.delete(reverse("shiny_delete_da_4856", kwargs={"da_4856_id": 51198}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_DA4856_DOES_NOT_EXIST)

        # Assert data is updated as expected
        self.assertEqual(DA_4856.objects.count(), 1)

    def test_valid_request(self):
        # make the request
        resp = self.client.delete(reverse("shiny_delete_da_4856", kwargs={"da_4856_id": self.da_4856.id}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(
            resp.content.decode("utf-8"), "DA4856 ({}) removed from User's view.".format(self.da_4856.title)
        )

        self.da_4856.refresh_from_db()

        self.assertEqual(self.da_4856.visible_to_user, False)
