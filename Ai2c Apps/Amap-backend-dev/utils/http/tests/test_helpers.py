"""Helper function test cases"""

from django.test import TestCase, tag

from utils.http.helpers import update_object_attributes, validate_allowed_fields, validate_required_fields
from utils.tests import create_testing_unit


@tag("helpers")
class HelperTestCases(TestCase):
    """Helpers Test Cases"""

    maxDiff = None

    def setUp(self):
        self.test_dict = {
            "field_1": "value_1",
            "field_2": "value_2",
            "field_3": "value_3",
        }
        self.unit = create_testing_unit()

    # validate_required_fields ==============================================================================
    def test_validate_required_fields__success(self):
        required_fields = ["field_1", "field_2"]
        errors = validate_required_fields(required_fields, self.test_dict)
        self.assertEqual([], errors)

    def test_validate_required_fields__success_with_bool(self):
        required_fields = ["field_1", "field_2"]
        is_valid = validate_required_fields(required_fields, self.test_dict, return_bool=True)
        self.assertEqual(True, is_valid)

    def test_validate_required_fields__fail(self):
        required_fields = ["missing_required_field"]
        errors = validate_required_fields(required_fields, self.test_dict)
        self.assertEqual(["missing_required_field missing."], errors)

    def test_validate_required_fields__fail_with_bool(self):
        required_fields = ["missing_required_field"]
        is_valid = validate_required_fields(required_fields, self.test_dict, return_bool=True)
        self.assertEqual(False, is_valid)

    # validate_allowed_fields ==============================================================================
    def test_validate_allowed_fields__success(self):
        allowable_fields = ["field_1", "field_2", "field_3"]
        errors = validate_allowed_fields(allowable_fields, self.test_dict)
        self.assertEqual([], errors)

    def test_validate_allowed_fields__success_with_bool(self):
        allowable_fields = ["field_1", "field_2", "field_3"]
        is_valid = validate_allowed_fields(allowable_fields, self.test_dict, return_bool=True)
        self.assertEqual(True, is_valid)

    def test_validate_allowed_fields__fail(self):
        allowable_fields = ["field_1", "field_2"]  # Field 3 not allowed
        errors = validate_allowed_fields(allowable_fields, self.test_dict)
        self.assertEqual(["field_3 not allowed."], errors)

    def test_validate_allowed_fields__fail_with_bool(self):
        allowable_fields = ["field_1", "field_2"]  # Field 3 not allowed
        is_valid = validate_allowed_fields(allowable_fields, self.test_dict, return_bool=True)
        self.assertEqual(False, is_valid)

    # update_object_attributes ==============================================================================
    def test_update_object_attributes__success(self):
        update_object_attributes({"uic": "UPDATED_UIC"}, self.unit)
        self.assertEqual("UPDATED_UIC", self.unit.uic)

    def test_update_object_attributes__fail(self):
        self.assertRaises(AttributeError, update_object_attributes, {"not_an_attribute": "FAIL"}, self.unit)
