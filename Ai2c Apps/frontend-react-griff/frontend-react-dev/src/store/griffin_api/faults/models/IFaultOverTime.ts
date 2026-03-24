/**
 * @typedef IFaultOverTime
 */
export interface IFaultOverTime {
  reporting_period: Date | string;
  no_status: number;
  cleared: number;
  ti_cleared: number;
  diagonal: number;
  dash: number;
  admin_deadline: number;
  deadline: number;
  circle_x: number;
  nuclear: number;
  chemical: number;
  biological: number;
}
