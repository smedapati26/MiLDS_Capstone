import { ISoldier } from '@store/amap_ai/soldier';

export interface TransferRequestDto {
  requester_name: string;
  soldier_user_id: string;
  soldier_unit_uic: string;
  soldier_name: string;
  soldier_unit_short_name: string;
  gaining_unit_short_name: string;
  gaining_unit_uic: string;
  managers: ManagerDto[];
}

export interface TransferRequest {
  requesterName: string;
  soldierUserId: string;
  soldierUnitUic: string;
  soldierName: string;
  soldierUnitShortName: string;
  gainingUnitShortName: string;
  gainingUnitUic: string;
  managers: Manager[];
}

export interface Manager {
  name: string;
  unit: string;
  dodEmail: string;
}

export interface ManagerDto {
  name: string;
  unit: string;
  dod_email: string;
}

export type ITransferSolder = ISoldier & { isAmtpMaintainer: boolean };

export interface ISoldierUnits {
  id: string;
  unitName: string;
  soldiers: ITransferSolder[];
}
