import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from uas.model_utils import UASStatuses
from uas.models import UAC, UAV
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import create_single_test_uac, create_single_test_uav, create_test_units, get_default_top_unit


@tag("uas", "shiny_uas_status_calculations")
class TestShinyUASStatusCalculations(TestCase):
    def setUp(self):
        create_test_units()

        self.unit_1 = get_default_top_unit()

        self.uac = []
        self.uav = []

        # Set up the models needed for a FMC MQ and RQ UAS System default calculation
        creation_system_names_and_ranges = {
            "Q-1": [["GCS", 5], ["GDT", 6], ["SGDT", 2], ["UAV", 9]],
            "Q-7": [["GCS", 2], ["GDT", 2], ["TALS", 2], ["LAU", 2], ["UAV", 3]],
        }

        for system, system_names_and_ranges in creation_system_names_and_ranges.items():
            for name_and_range in system_names_and_ranges:
                for i in range(name_and_range[1]):
                    if name_and_range[0] != "UAV":
                        self.uac.append(
                            create_single_test_uac(
                                current_unit=self.unit_1,
                                serial_number=system + name_and_range[0] + str(i),
                                model=system + name_and_range[0] + str(i),
                                status=UASStatuses.FMC,
                            )
                        )
                    else:
                        self.uav.append(
                            create_single_test_uav(
                                current_unit=self.unit_1,
                                serial_number=system + name_and_range[0] + str(i),
                                model=system + name_and_range[0] + str(i),
                                status=UASStatuses.FMC,
                            )
                        )

    def test_invalid_unit(self):
        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": "NOTAUNIT"}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_no_operational_uas(self):
        # Update the status of all UAV and UAC for this unit
        for uac in UAC.objects.all():
            uac.status = UASStatuses.NMC
            uac.save()
        for uav in UAV.objects.all():
            uav.status = UASStatuses.NMC
            uav.save()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [],
            "rq_status": [],
        }
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_pmc_GCS_system(self):
        # Remove 1 MQ and 1 RQ GCS to make the system PMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GCS").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="GCS").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
        }
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_pmc_GDT_system(self):
        # Remove 1 MQ and 1 RQ GDT to make the system PMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GDT").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="GDT").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_pmc_UAV_system(self):
        # Remove 1 MQ and 1 RQ UAV to make the system PMC
        UAV.objects.filter(model__contains="Q-1").first().delete()
        UAV.objects.filter(model__contains="Q-7").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_pmc_mq_SGDT_system(self):
        # Remove 1 MQ SGDT to make the system PMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="SGDT").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_pmc_rq_TALS_system(self):
        # Remove 1 RQ TALS to make the system PMC
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="TALS").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_pmc_rq_LAU_system(self):
        # Remove 1 1 RQ LAU to make the system PMC
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="LAU").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.PMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_nmc_GCS_system(self):
        # Remove 2 MQ and 1 RQ GCS to make the system PMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GCS").first().delete()
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GCS").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="GCS").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_nmc_GDT_system(self):
        # Remove 3 MQ and 1 RQ GDT to make the system NMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GDT").first().delete()
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GDT").first().delete()
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="GDT").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="GDT").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_nmc_UAV_system(self):
        # Remove 4 MQ and 2 RQ UAV to make the system NMC
        UAV.objects.filter(model__contains="Q-1").first().delete()
        UAV.objects.filter(model__contains="Q-1").first().delete()
        UAV.objects.filter(model__contains="Q-1").first().delete()
        UAV.objects.filter(model__contains="Q-1").first().delete()
        UAV.objects.filter(model__contains="Q-7").first().delete()
        UAV.objects.filter(model__contains="Q-7").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_nmc_mq_SGDT_system(self):
        # Remove 2 MQ SGDT to make the system NMC
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="SGDT").first().delete()
        UAC.objects.filter(model__contains="Q-1").filter(model__contains="SGDT").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_nmc_rq_TALS_system(self):
        # Remove 2 RQ TALS to make the system NMC
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="TALS").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="TALS").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_nmc_rq_LAU_system(self):
        # Remove 2 RQ LAU to make the system NMC
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="LAU").first().delete()
        UAC.objects.filter(model__contains="Q-7").filter(model__contains="LAU").first().delete()

        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.NMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)

    def test_fmc_system(self):
        # Make the API call
        resp = self.client.get(reverse("uas_system", kwargs={"uic": self.unit_1.uic}))

        # Set up the expected and actual data
        expected_data = {
            "mq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
            "rq_status": [{"current_unit": self.unit_1.uic, "System Status": UASStatuses.FMC}],
        }
        expected_mq_data = expected_data["mq_status"]
        expected_rq_data = expected_data["rq_status"]

        actual_data = json.loads(resp.content.decode("utf-8"))
        actual_mq_data = actual_data["mq_status"]
        actual_rq_data = actual_data["rq_status"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_mq_data, expected_mq_data)
        self.assertCountEqual(actual_rq_data, expected_rq_data)
