import io
import zipfile
from http import HTTPStatus
from unittest.mock import patch
from urllib.parse import urlencode

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from utils.tests import (
    create_single_supporting_document_type,
    create_single_test_event,
    create_single_test_supporting_document,
    create_test_4856,
    create_test_4856_pdf,
    create_test_event_task,
    create_test_ictl,
    create_test_ictl_task,
    create_test_mos,
    create_test_mos_ictl,
    create_test_soldier,
    create_test_task,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("shiny_amap_packet")
class TestShinyAmapPacket(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.api_client = TestClient(router)

        self.unit = create_testing_unit()

        self.soldier = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, first_name="Other", last_name="User", user_id="0123456789")

        self.doc_type = create_single_supporting_document_type("Orders")
        self.soldier_1_support_doc = create_single_test_supporting_document(
            soldier=self.soldier, document_type=self.doc_type
        )
        self.soldier_2_support_doc = create_single_test_supporting_document(
            id=2, soldier=self.soldier_2, document_type=self.doc_type
        )

        self.soldier_1_da_4856_pdf = create_test_4856_pdf()
        self.soldier_2_da_4856_pdf = create_test_4856_pdf()

        self.soldier_1_da_4856 = create_test_4856(soldier=self.soldier, document=self.soldier_1_da_4856_pdf)
        self.soldier_2_da_4856 = create_test_4856(id=2, soldier=self.soldier_2, document=self.soldier_2_da_4856_pdf)

        self.soldier_1_da_7817 = create_single_test_event(
            soldier=self.soldier, uic=self.unit, recorded_by=self.soldier_2
        )
        self.soldier_2_da_7817 = create_single_test_event(
            id=2, soldier=self.soldier_2, uic=self.unit, recorded_by=self.soldier
        )

        self.soldier_1_ictl = create_test_ictl(proponent=None, unit=self.unit)
        self.soldier_1_uctl = create_test_ictl(ictl_id=2)

        self.soldier_2_ictl = create_test_ictl(ictl_id=77, proponent=None, unit=self.unit)
        self.soldier_2_uctl = create_test_ictl(ictl_id=4)

        self.soldier_1_task = create_test_task()
        self.soldier_2_task = create_test_task(task_number="TEST000AA-TASK0001")

        self.soldier_1_mos = create_test_mos()
        self.soldier_2_mos = create_test_mos()

        self.soldier_1_mos_ictl = create_test_mos_ictl(mos=self.soldier_1_mos, ictl=self.soldier_1_ictl)
        self.soldier_1_mos_uctl = create_test_mos_ictl(id=2, mos=self.soldier_1_mos, ictl=self.soldier_1_uctl)
        self.soldier_2_mos_ictl = create_test_mos_ictl(id=3, mos=self.soldier_2_mos, ictl=self.soldier_2_ictl)
        self.soldier_2_mos_uctl = create_test_mos_ictl(id=4, mos=self.soldier_2_mos, ictl=self.soldier_2_uctl)

        self.soldier_1_ictl_task = create_test_ictl_task(task=self.soldier_1_task, ictl=self.soldier_1_ictl)
        self.soldier_1_uctl_task = create_test_ictl_task(id=2, task=self.soldier_1_task, ictl=self.soldier_1_uctl)

        self.soldier_2_ictl_task = create_test_ictl_task(id=3, task=self.soldier_2_task, ictl=self.soldier_2_ictl)
        self.soldier_2_uctl_task = create_test_ictl_task(id=4, task=self.soldier_2_task, ictl=self.soldier_2_uctl)

        self.soldier_1_event_task = create_test_event_task(event=self.soldier_1_da_7817, task=self.soldier_1_task)
        self.soldier_2_event_task = create_test_event_task(id=2, event=self.soldier_2_da_7817, task=self.soldier_2_task)

        self.request_url = "/amap-packet"

        self.request_query_parameters = [
            ("soldier_ids", self.soldier.user_id),
            ("soldier_ids", self.soldier_2.user_id),
            ("include_ictl", True),
            ("include_uctl", True),
            ("include_da_4856", True),
            ("include_da_7817", True),
            ("include_supporting_documents", True),
        ]

        self.expected_returned_files = [
            # Soldier 1
            "{}/".format(self.soldier.name_and_rank()),
            "{}/Supporting Documents/".format(self.soldier.name_and_rank()),
            "{}/Supporting Documents/{}.txt".format(
                self.soldier.name_and_rank(), self.soldier_1_support_doc.document_title
            ),
            "{}/DA 4856s/".format(self.soldier.name_and_rank()),
            "{}/DA 4856s/{}.pdf".format(self.soldier.name_and_rank(), self.soldier_1_da_4856.title),
            "{}/DA 7817s/".format(self.soldier.name_and_rank()),
            "{}/DA 7817s/BLANK_DA7817_Page_1.pdf".format(self.soldier.name_and_rank()),
            "{}/DA 7817s/{}_{}_DA7817_Data_Page_1.xml".format(
                self.soldier.name_and_rank(), self.soldier.first_name, self.soldier.last_name
            ),
            "{}/Critical Task Lists/".format(self.soldier.name_and_rank()),
            "{}/Critical Task Lists/USAACE Task Lists.xlsx".format(self.soldier.name_and_rank()),
            "{}/Critical Task Lists/Unit Task Lists.xlsx".format(self.soldier.name_and_rank()),
            # Soldier 2
            "{}/".format(self.soldier_2.name_and_rank()),
            "{}/Supporting Documents/".format(self.soldier_2.name_and_rank()),
            "{}/Supporting Documents/{}.txt".format(
                self.soldier_2.name_and_rank(), self.soldier_2_support_doc.document_title
            ),
            "{}/DA 4856s/".format(self.soldier_2.name_and_rank()),
            "{}/DA 4856s/{}.pdf".format(self.soldier_2.name_and_rank(), self.soldier_2_da_4856.title),
            "{}/DA 7817s/".format(self.soldier_2.name_and_rank()),
            "{}/DA 7817s/BLANK_DA7817_Page_1.pdf".format(self.soldier_2.name_and_rank()),
            "{}/DA 7817s/{}_{}_DA7817_Data_Page_1.xml".format(
                self.soldier_2.name_and_rank(), self.soldier_2.first_name, self.soldier_2.last_name
            ),
            "{}/Critical Task Lists/".format(self.soldier_2.name_and_rank()),
            "{}/Critical Task Lists/USAACE Task Lists.xlsx".format(self.soldier_2.name_and_rank()),
            "{}/Critical Task Lists/Unit Task Lists.xlsx".format(self.soldier_2.name_and_rank()),
        ]

        self.get_user_id.return_value = self.soldier.user_id
        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_empty_request(self):
        # Make the api call
        resp = self.api_client.get(self.request_url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.UNPROCESSABLE_ENTITY)

    @tag("testy")
    def test_single_soldier_no_data(self):
        # Create new soldier
        soldier_3 = create_test_soldier(
            unit=self.unit,
            first_name="Newest",
            last_name="User",
            user_id="9012345678",
        )

        # Update existing query parameters to only be the new soldier
        self.request_query_parameters.pop(1)  # Soldier 2
        self.request_query_parameters.pop(0)  # Soldier

        self.request_query_parameters.append(("soldier_ids", soldier_3.user_id))

        # Make the api call
        url = "{}?{}".format(self.request_url, urlencode(self.request_query_parameters))
        resp = self.api_client.get(url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp["Content-Type"], "application/zip")

        # Get the response content
        resp_zip_content = io.BytesIO(resp.content)

        # Set up the expected returned data
        expected_returned_files = [
            "{}/".format(soldier_3.name_and_rank()),
            "{}/Critical Task Lists/".format(soldier_3.name_and_rank()),
            "{}/Critical Task Lists/Unit Task Lists.xlsx".format(soldier_3.name_and_rank()),
            "{}/Critical Task Lists/USAACE Task Lists.xlsx".format(soldier_3.name_and_rank()),
        ]

        # Read the response content and assert expected values
        with zipfile.ZipFile(resp_zip_content, "r") as resp_zip:
            # Assert that an only the Unit UCTL data is returned
            self.assertCountEqual(resp_zip.namelist(), expected_returned_files)

    def test_single_soldier_partial(self):
        # Update existing query parameters and expected return data to only be the one soldier
        self.request_query_parameters.pop(1)  # Soldier 2
        expected_returned_files = [x for x in self.expected_returned_files if self.soldier_2.name_and_rank() not in x]

        query_to_remove = ["ictl", "uctl", "da_4856", "da_7817", "supporting_documents"]

        expected_data_to_remove = ["USAACE", "Unit", "DA 4856", "DA 7817", "Supporting Documents"]

        # Start the iterative testing loop
        for index in range(len(query_to_remove)):
            # Update the query parameters
            request_query_parameters = [x for x in self.request_query_parameters if query_to_remove[index] not in x[0]]
            # Make the api call
            url = "{}?{}".format(self.request_url, urlencode(request_query_parameters))
            resp = self.api_client.get(url)

            # Assert the expected response
            self.assertEqual(resp.status_code, HTTPStatus.OK)
            self.assertEqual(resp["Content-Type"], "application/zip")

            # Get the response content
            resp_zip_content = io.BytesIO(resp.content)

            # Set up the expected returned data
            actual_returned_files = [x for x in expected_returned_files if expected_data_to_remove[index] not in x]

            # Read the response content and assert expected values
            with zipfile.ZipFile(resp_zip_content, "r") as resp_zip:
                # Assert that an only the Unit UCTL data is returned
                self.assertCountEqual(resp_zip.namelist(), actual_returned_files)

    def test_single_soldier_full(self):
        # Update existing query parameters and expected return data to only be the one soldier
        self.request_query_parameters.pop(1)  # Soldier 2
        expected_returned_files = [x for x in self.expected_returned_files if self.soldier_2.name_and_rank() not in x]

        # Make the api call
        url = "{}?{}".format(self.request_url, urlencode(self.request_query_parameters))
        resp = self.api_client.get(url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp["Content-Type"], "application/zip")

        # Get the response content
        resp_zip_content = io.BytesIO(resp.content)

        # Read the response content and assert expected values
        with zipfile.ZipFile(resp_zip_content, "r") as resp_zip:
            # Assert that an only the Unit UCTL data is returned
            self.assertCountEqual(resp_zip.namelist(), expected_returned_files)

    def test_multiple_soldier_partial(self):
        query_to_remove = ["ictl", "uctl", "da_4856", "da_7817", "supporting_documents"]

        expected_data_to_remove = ["USAACE", "Unit", "DA 4856", "DA 7817", "Supporting Documents"]

        # Start the iterative testing loop
        for index in range(len(query_to_remove)):
            # Update the query parameters
            request_query_parameters = [x for x in self.request_query_parameters if query_to_remove[index] not in x[0]]
            # Make the api call
            url = "{}?{}".format(self.request_url, urlencode(request_query_parameters))
            resp = self.api_client.get(url)

            # Assert the expected response
            self.assertEqual(resp.status_code, HTTPStatus.OK)
            self.assertEqual(resp["Content-Type"], "application/zip")

            # Get the response content
            resp_zip_content = io.BytesIO(resp.content)

            # Set up the expected returned data
            actual_returned_files = [x for x in self.expected_returned_files if expected_data_to_remove[index] not in x]

            # Read the response content and assert expected values
            with zipfile.ZipFile(resp_zip_content, "r") as resp_zip:
                # Assert that an only the Unit UCTL data is returned
                self.assertCountEqual(resp_zip.namelist(), actual_returned_files)

    @tag("testy2")
    def test_multiple_soldier_full(self):
        # Make the api call
        url = "{}?{}".format(self.request_url, urlencode(self.request_query_parameters))
        resp = self.api_client.get(url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp["Content-Type"], "application/zip")

        # Get the response content
        resp_zip_content = io.BytesIO(resp.content)

        # Read the response content and assert expected values
        with zipfile.ZipFile(resp_zip_content, "r") as resp_zip:
            # Assert that an only the Unit UCTL data is returned
            self.assertCountEqual(resp_zip.namelist(), self.expected_returned_files),
