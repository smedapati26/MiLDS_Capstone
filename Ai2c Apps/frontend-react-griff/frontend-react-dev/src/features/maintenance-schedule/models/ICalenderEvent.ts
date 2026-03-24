import dayjs from 'dayjs';

/* Represents maintenance lane calender event type */
export enum CalenderEventTypeEnum {
  DEFAULT = 'default',
  HOLIDAY = 'holiday',
  WEEKEND = 'weekend',
  TODAY = 'today',
}

/* Represents maintenance lane calender event */
export interface ICalenderEvent {
  id: string | number;
  name: string;
  type: CalenderEventTypeEnum;
  startDate: string | Date | dayjs.Dayjs;
  endDate: string | Date | dayjs.Dayjs;
  unit?: string;
  notes?: string;
  poc?: string;
  altPoc?: string;
}
