export interface IUnitSoldierFlagDTO {
  name: string;
  rank: string;
  dod_id: string;
  mx_availability: string;
  unit: string;
  roles: string[];
  designations: string | undefined;
  is_maintainer: boolean;
  is_amtp_maintainer: boolean;
}

export interface IUnitSoldierFlag {
  name: string;
  rank: string;
  dodId: string;
  mxAvailability: string;
  unit: string;
  roles: string[];
  designations: string | undefined;
  isMaintainer: boolean;
  isAmtpMaintainer: boolean;
}

export const mapToIUnitSoldierFlag = (dto: IUnitSoldierFlagDTO): IUnitSoldierFlag => {
  return {
    name: dto.name,
    rank: dto.rank,
    dodId: dto.dod_id,
    mxAvailability: dto.mx_availability,
    unit: dto.unit,
    roles: dto.roles,
    designations: dto.designations,
    isMaintainer: dto.is_maintainer,
    isAmtpMaintainer: dto.is_amtp_maintainer,
  };
};

export interface ICreateSoldierDTO {
  dod_id: string;
  first_name: string;
  last_name: string;
  rank: string;
  unit_uic: string;
  roles: { unit_uic: string; role: string }[];
  is_maintainer: boolean;
}

export interface ISoldierActiveFlagDTO {
  flag_id: number;
  flag_type: string;
  flag_info: string | undefined;
  mx_availability: string;
  start_date: string;
  end_date: string | undefined;
  remarks: string | undefined;
}

export interface ISoldierActiveFlag {
  flagId: number;
  flagType: string;
  flagInfo: string | undefined;
  mxAvailability: string;
  startDate: string;
  endDate: string | undefined;
  remarks: string | undefined;
}

export const mapToISoldierActiveFlag = (dto: ISoldierActiveFlagDTO): ISoldierActiveFlag => {
  return {
    flagId: dto.flag_id,
    flagType: dto.flag_type,
    flagInfo: dto.flag_info,
    mxAvailability: dto.mx_availability,
    startDate: dto.start_date,
    endDate: dto.end_date,
    remarks: dto.remarks,
  };
};

export interface IUnitActiveFlagDTO {
  flag_id: number;
  unit: string;
  unit_uic: string;
  flag_type: string;
  flag_info: string | undefined;
  mx_availability: string;
  maintainer_count: number;
  start_date: string;
  end_date: string | undefined;
  remarks: string | undefined;
}

export interface IUnitActiveFlag {
  flagId: number;
  unit: string;
  unitUic: string;
  flagType: string;
  flagInfo: string | undefined;
  mxAvailability: string;
  maintainerCount: number;
  startDate: string;
  endDate: string | undefined;
  remarks: string | undefined;
}

export const mapToIUnitActiveFlag = (dto: IUnitActiveFlagDTO): IUnitActiveFlag => {
  return {
    flagId: dto.flag_id,
    unit: dto.unit,
    unitUic: dto.unit_uic,
    flagType: dto.flag_type,
    flagInfo: dto.flag_info,
    mxAvailability: dto.mx_availability,
    maintainerCount: dto.maintainer_count,
    startDate: dto.start_date,
    endDate: dto.end_date,
    remarks: dto.remarks,
  };
};

export interface ISoldierUnitRoleAndDesignationDTO {
  unit_name: string;
  unit_uic: string;
  role_id: number | undefined;
  role_type: string | undefined;
  designation_id: number | undefined;
  designation_type: string | undefined;
}

export interface ISoldierUnitRoleAndDesignation {
  unitName: string;
  unitUic: string;
  roleId: number | undefined;
  roleType: string | undefined;
  designationId: number | undefined;
  designationType: string | undefined;
}

export const mapToISoldierUnitRoleAndDesignation = (
  dto: ISoldierUnitRoleAndDesignationDTO,
): ISoldierUnitRoleAndDesignation => {
  return {
    unitName: dto.unit_name,
    unitUic: dto.unit_uic,
    roleId: dto.role_id,
    roleType: dto.role_type,
    designationId: dto.designation_id,
    designationType: dto.designation_type,
  };
};

export interface ISoldierInfoDTO {
  name: string;
  rank: string | undefined;
  dod_id: string;
  current_unit: string;
  primary_mos: string;
  additional_mos: string[];
  unit_roles_and_designations: ISoldierUnitRoleAndDesignationDTO[];
  is_maintainer: boolean;
}

export interface ISoldierInfo {
  name: string;
  rank: string | undefined;
  dodId: string;
  currentUnit: string;
  primaryMos: string;
  additionalMos: string[];
  unitRolesAndDesignations: ISoldierUnitRoleAndDesignation[];
  isMaintainer: boolean;
}

export const mapToISoldierInfo = (dto: ISoldierInfoDTO): ISoldierInfo => {
  return {
    name: dto.name,
    rank: dto.rank,
    dodId: dto.dod_id,
    currentUnit: dto.current_unit,
    primaryMos: dto.primary_mos,
    additionalMos: dto.additional_mos,
    unitRolesAndDesignations: dto.unit_roles_and_designations.map(mapToISoldierUnitRoleAndDesignation),
    isMaintainer: dto.is_maintainer,
  };
};

export interface IUnitReceivedTransferRequestDTO {
  request_id: number;
  name: string;
  rank: string;
  dod_id: string;
  current_unit: string;
  current_unit_uic: string;
  requesting_unit: string;
  requesting_unit_uic: string;
  requested_by: string;
}

export interface IUnitReceivedTransferRequest {
  requestId: number;
  name: string;
  rank: string;
  dodId: string;
  currentUnit: string;
  currentUnitUic: string;
  requestingUnit: string;
  requestingUnitUic: string;
  requestedBy: string;
}

export const mapToIUnitReceivedTransferRequest = (
  dto: IUnitReceivedTransferRequestDTO,
): IUnitReceivedTransferRequest => {
  return {
    requestId: dto.request_id,
    name: dto.name,
    rank: dto.rank,
    dodId: dto.dod_id,
    currentUnit: dto.current_unit,
    currentUnitUic: dto.current_unit_uic,
    requestingUnit: dto.requesting_unit,
    requestingUnitUic: dto.requesting_unit_uic,
    requestedBy: dto.requested_by,
  };
};

export interface IUnitSentTransferRequestDTO {
  request_id: number;
  name: string;
  rank: string;
  dod_id: string;
  current_unit: string;
  current_unit_uic: string;
  requesting_unit: string;
  requesting_unit_uic: string;
  pocs: { name: string; email: string | undefined }[];
}

export interface IUnitSentTransferRequest {
  requestId: number;
  name: string;
  rank: string;
  dodId: string;
  currentUnit: string;
  currentUnitUic: string;
  requestingUnit: string;
  requestingUnitUic: string;
  pocs: { name: string; email: string | undefined }[];
}

export const mapToIUnitSentTransferRequest = (dto: IUnitSentTransferRequestDTO): IUnitSentTransferRequest => {
  return {
    requestId: dto.request_id,
    name: dto.name,
    rank: dto.rank,
    dodId: dto.dod_id,
    currentUnit: dto.current_unit,
    currentUnitUic: dto.current_unit_uic,
    requestingUnit: dto.requesting_unit,
    requestingUnitUic: dto.requesting_unit_uic,
    pocs: dto.pocs,
  };
};
