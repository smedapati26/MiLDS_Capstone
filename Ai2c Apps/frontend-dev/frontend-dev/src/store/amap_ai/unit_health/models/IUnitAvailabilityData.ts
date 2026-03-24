export interface IUnitAvailabilityFlagDetailsDTO {
  status: string;
  flag_info?: string;
  remarks?: string;
  start_date: string;
  end_date?: string;
  flag_type?: string;
  recorced_by?: string;
  updated_by?: string;
  unit?: string;
}

export interface IUnitAvailabilityFlagDetails {
  status: string;
  flagInfo?: string;
  remarks?: string;
  startDate: string;
  endDate?: string;
  flagType?: string;
  recorcedBy?: string;
  updatedBy?: string;
  unit?: string;
}

export const mapToIUnitAvailabilityFlagDetails = (
  dto: IUnitAvailabilityFlagDetailsDTO | undefined,
): IUnitAvailabilityFlagDetails | undefined => {
  if (dto) {
    return {
      status: dto.status,
      flagInfo: dto.flag_info,
      remarks: dto.remarks,
      startDate: dto.start_date,
      endDate: dto.end_date,
      flagType: dto.flag_type,
      recorcedBy: dto.recorced_by,
      updatedBy: dto.updated_by,
      unit: dto.unit,
    };
  }
  return undefined;
};

export interface IUnitAvailabilitySoldierDataDTO {
  name: string;
  user_id: string;
  email: string;
  availability: string;
  unit: string;
  mos: string;
  ml: string;
  flag_details?: IUnitAvailabilityFlagDetailsDTO;
}

export interface IUnitAvailabilitySoldierData {
  name: string;
  userId: string;
  email: string;
  availability: string;
  unit: string;
  mos: string;
  ml: string;
  flagDetails?: IUnitAvailabilityFlagDetails;
}

export const mapToIUnitAvailabilitySoldierData = (
  dto: IUnitAvailabilitySoldierDataDTO,
): IUnitAvailabilitySoldierData => {
  return {
    name: dto.name,
    userId: dto.user_id,
    email: dto.email,
    availability: dto.availability,
    unit: dto.unit,
    mos: dto.mos,
    ml: dto.ml,
    flagDetails: mapToIUnitAvailabilityFlagDetails(dto.flag_details),
  };
};

export interface IUnitAvailabilityDataDTO {
  unit_name: string;
  soldiers: IUnitAvailabilitySoldierDataDTO[];
}

export interface IUnitAvailabilityData {
  unitName: string;
  soldiers: IUnitAvailabilitySoldierData[];
}

export const mapToIUnitAvailabilityData = (dto: IUnitAvailabilityDataDTO): IUnitAvailabilityData => {
  return {
    unitName: dto.unit_name,
    soldiers: dto.soldiers.map(mapToIUnitAvailabilitySoldierData),
  };
};
