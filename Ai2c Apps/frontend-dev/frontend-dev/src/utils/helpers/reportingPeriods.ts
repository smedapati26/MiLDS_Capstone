import dayjs, { Dayjs } from 'dayjs';

export interface IReportingPeriod {
  startDate: Dayjs;
  endDate: Dayjs;
}

export const getReportingPeriod = (today: Dayjs = dayjs()): IReportingPeriod => {
  let startDate: Dayjs;
  let endDate: Dayjs;

  if (today.date() <= 15) {
    const previousMonthDate = today.subtract(1, 'month');
    startDate = dayjs().year(previousMonthDate.year()).month(previousMonthDate.month()).date(16);
    endDate = dayjs().year(today.year()).month(today.month()).date(15);
  } else {
    const nextMonthDate = today.add(1, 'month');
    startDate = dayjs().year(today.year()).month(today.month()).date(16);
    endDate = dayjs().year(nextMonthDate.year()).month(nextMonthDate.month()).date(15);
  }

  return { startDate, endDate };
};
