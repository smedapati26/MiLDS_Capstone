import { ISoldier } from '@store/amap_ai/soldier';

export interface ISoldierPermissionRequestDTO {
  request_id: number;
  name: string;
  rank: string;
  dod_id: string;
  unit: string;
  last_active: string;
  current_role: string;
  requested_role: string;
}

export interface ISoldierPermissionRequest {
  requestId: number;
  name: string;
  rank: string;
  dodId: string;
  unit: string;
  lastActive: string;
  currentRole: string;
  requestedRole: string;
}

export const mapToISoldierPermissionRequest = (dto: ISoldierPermissionRequestDTO): ISoldierPermissionRequest => {
  return {
    requestId: dto.request_id,
    name: dto.name,
    rank: dto.rank,
    dodId: dto.dod_id,
    unit: dto.unit,
    lastActive: dto.last_active,
    currentRole: dto.current_role,
    requestedRole: dto.requested_role,
  };
};

export interface IUnitPermissionRequestDTO {
  unit_uic: string;
  unit_name: string;
  requests: ISoldierPermissionRequestDTO[];
}

export interface IUnitPermissionRequest {
  unitUic: string;
  unitName: string;
  requests: ISoldierPermissionRequest[];
}

export const mapToIUnitPermissionRequest = (dto: IUnitPermissionRequestDTO): IUnitPermissionRequest => {
  return {
    unitUic: dto.unit_uic,
    unitName: dto.unit_name,
    requests: dto.requests.map(mapToISoldierPermissionRequest),
  };
};

export interface IUserPermission {
  unit: string;
  permission: string;
}

export interface IUserRequestedPermissions {
  requestId: number;
  unit: string;
  permission: string;
  approvers: ISoldier[];
}
