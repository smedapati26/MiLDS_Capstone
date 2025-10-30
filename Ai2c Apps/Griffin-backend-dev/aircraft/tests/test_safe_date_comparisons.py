from datetime import datetime

from django.test import TestCase, tag
from django.utils import timezone

from utils.time import is_up_to_date


@tag("aircraft")
class IsUpToDateTestCase(TestCase):
    def test_both_naive(self):
        # Up to date
        current_time = datetime(2023, 9, 18, 1, 0, 0)
        new_time = datetime(2023, 9, 18, 1, 0, 0)
        self.assertTrue(is_up_to_date(new_time=new_time, existing_time=current_time))
        # New data available
        new_time = datetime(2023, 9, 27, 1, 0, 0)
        self.assertFalse(is_up_to_date(new_time=new_time, existing_time=current_time))

    def test_new_aware(self):
        # Up to date
        current_time = datetime(2023, 9, 18, 1, 0, 0)
        new_time = datetime(2023, 9, 18, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        self.assertTrue(is_up_to_date(new_time=new_time, existing_time=current_time))
        # New data available
        new_time = datetime(2023, 9, 27, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        self.assertFalse(is_up_to_date(new_time=new_time, existing_time=current_time))

    def test_current_aware(self):
        # Up to date
        current_time = datetime(2023, 9, 18, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        new_time = datetime(2023, 9, 18, 1, 0, 0)
        self.assertTrue(is_up_to_date(new_time=new_time, existing_time=current_time))
        # New data available
        new_time = datetime(2023, 9, 27, 1, 0, 0)
        self.assertFalse(is_up_to_date(new_time=new_time, existing_time=current_time))

    def test_both_aware(self):
        # Up to date
        current_time = datetime(2023, 9, 18, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        new_time = datetime(2023, 9, 18, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        self.assertTrue(is_up_to_date(new_time=new_time, existing_time=current_time))
        # New data available
        new_time = datetime(2023, 9, 27, 1, 0, 0, tzinfo=timezone.get_default_timezone())
        self.assertFalse(is_up_to_date(new_time=new_time, existing_time=current_time))
