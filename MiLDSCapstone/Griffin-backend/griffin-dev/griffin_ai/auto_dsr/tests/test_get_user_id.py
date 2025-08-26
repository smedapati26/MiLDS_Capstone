from django.test import TestCase

from utils.http import get_user_id, get_user_string, parse_user_id


class GetUserIdTestCase(TestCase):
    def setUp(self):
        self.headers = {"Auth-User": "CN=DOE.JANE.B.1111111111,OU=USA,OU=PKI,OU=DoD,O=U.S. Government,C=US"}
        self.invalid_headers = {"Header": "Something Else"}
        self.header_user_id = "1111111111"
        self.default_user_string = "CN=DOE.JOHN.A.0000000000,OU=USA,OU=PKI"
        self.default_user_id = "0000000000"

    def test_get_header_string(self):
        self.assertEqual(get_user_string(self.headers), self.headers["Auth-User"])

    def test_get_default_string(self):
        self.assertEqual(get_user_string(self.invalid_headers), self.default_user_string)

    def test_get_id_from_header(self):
        user_string = get_user_string(self.headers)
        self.assertEqual(parse_user_id(user_string), self.header_user_id)
        self.assertEqual(get_user_id(self.headers), self.header_user_id)

    def test_get_id_from_default_string(self):
        self.assertEqual(parse_user_id(self.default_user_string), self.default_user_id)
        self.assertEqual(get_user_id(self.invalid_headers), self.default_user_id)
