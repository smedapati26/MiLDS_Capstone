/* Represents  IFlyingHours the output data transfer object. */
export interface IFlyingHoursDto {
  monthly_hours_flown: number;
  monthly_hours_total: number;
  yearly_hours_flown: number;
  yearly_hours_total: number;
}

/* Represents  IFlyingHours Object */
export interface IFlyingHours {
  monthlyHoursFlown: number;
  monthlyHoursTotal: number;
  yearlyHoursFlown: number;
  yearlyHoursTotal: number;
}

/* Maps IFlyingHoursDto to  Object IFlyingHours */
export function mapToIFlyingHours(dto: IFlyingHoursDto): IFlyingHours {
  return {
    monthlyHoursFlown: dto.monthly_hours_flown,
    monthlyHoursTotal: dto.monthly_hours_total,
    yearlyHoursFlown: dto.yearly_hours_flown,
    yearlyHoursTotal: dto.yearly_hours_total,
  };
}
