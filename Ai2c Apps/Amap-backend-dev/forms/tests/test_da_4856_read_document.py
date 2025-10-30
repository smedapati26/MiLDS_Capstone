from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_404_DA4856_DOES_NOT_EXIST
from utils.tests import create_test_4856, create_test_4856_pdf, create_test_soldier, create_testing_unit


@tag("read_da4856")
class Read4856Test(TestCase):
    # Initial setup for the read 4856 endpoint functionality
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.counseling_pdf = create_test_4856_pdf()
        self.counseling = create_test_4856(soldier=self.soldier, document=self.counseling_pdf)
        self.second_counseling = create_test_4856(
            soldier=self.soldier, document=self.counseling_pdf, id=2, title="Test_Counseling_2"
        )

    @tag("read_da4856_invalid_id")
    def test_read_4856_invalid_id(self):
        """
        Checks that a request to read a 4856 with an invalid DA4856 id returns a not found error
        """
        url = reverse("read_da_4856_document", kwargs={"form_ids": "123123"})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_DA4856_DOES_NOT_EXIST)

    @tag("read_da4856_valid_id")
    def test_read_4856_valid_id(self):
        """
        Checks that a request to read a 4856 with a valid id returns a FileResponse
        """
        url = reverse("read_da_4856_document", kwargs={"form_ids": str(self.counseling.id)})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

    @tag("read_multiple_da4856_valid_id")
    def test_read_multiple_4856_valid_ids(self):
        """
        Checks that a request to read multiple 4856 with all valid ids returns a FileResponse with the
        correct amount of documents returned
        """
        url = reverse(
            "read_da_4856_document", kwargs={"form_ids": str(self.counseling.id) + "," + str(self.second_counseling.id)}
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
