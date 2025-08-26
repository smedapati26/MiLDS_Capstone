from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from tasks.models import Ictl
from utils.tests import create_test_ictl
from utils.http.constants import HTTP_SUCCESS_STATUS_CODE


@tag("tasks", "get_all_ictls")
class GetAllIctlsTest(TestCase):
    get_ctls_url = "tasks:get_all_ictls"
    json_content = "application/json"

    def setUp(self):
        self.ictl_one = create_test_ictl()
        self.ictl_two = create_test_ictl(ictl_id=2)
        self.superceded_ictl = create_test_ictl(ictl_id=3, status="Superceded")

    @tag("validation")
    def test_get_all_ictls(self):
        """
        Checks that all active ictls are retrieved with get request
        """
        response = self.client.get(reverse(self.get_ctls_url))
        ictls = response.json()["ictls"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(ictls), Ictl.objects.filter(status="Approved").count())

    @tag("validation")
    def test_get_all_ictls_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_ctls_url, kwargs={})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
