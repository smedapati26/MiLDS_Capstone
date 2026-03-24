import dayjs from 'dayjs';

import { getDateRangeDates } from '@utils/helpers';

import '@testing-library/jest-dom';

/* getDateRangeDates Tests */
describe('getDateRangeDatesTest', () => {
  const today = dayjs('10-15-2024');

  it('get date range gets all dates in the month', () => {
    const dateRanges = getDateRangeDates(today.startOf('month'), today.endOf('month'));
    expect(dateRanges.length).toBe(today.daysInMonth());
  });
});
