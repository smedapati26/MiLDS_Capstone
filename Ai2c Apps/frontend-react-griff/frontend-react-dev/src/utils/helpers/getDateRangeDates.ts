import dayjs from 'dayjs';

/**
 * Generates an array of dates between the given start and end dates, inclusive.
 *
 * @param startDate - The start date of the range.
 * @param endDate - The end date of the range.
 * @returns An array of dates from startDate to endDate, inclusive.
 */
export const getDateRangeDates = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  const dates: Array<dayjs.Dayjs> = [];
  const diff = endDate.diff(startDate, 'day');

  for (let index = 0; index <= diff; ++index) {
    const date = startDate.add(index, 'day');
    dates.push(date);
  }

  return dates;
};
