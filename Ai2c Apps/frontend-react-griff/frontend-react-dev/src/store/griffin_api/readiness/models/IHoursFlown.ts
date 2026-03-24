export interface IHoursDetail {
  hours_flown: number;
  reporting_month: string;
}
export interface IHoursFlown {
  hours_detail: IHoursDetail[];
}

export interface IHoursFlownUnits extends IHoursFlown {
  uic: string;
}

export interface IHoursFlownSubordinate extends IHoursFlownUnits {
  parent_uic: string;
}

export interface IHoursFlownModel extends IHoursFlown {
  model: string;
}
