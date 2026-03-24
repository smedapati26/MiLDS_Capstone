export interface IUnitMissingPacketsSoldierDataDTO {
  name: string;
  user_id: string;
  packet_status: string;
  unit: string;
  arrival_at_unit?: string;
}

export interface IUnitMissingPacketsSoldierData {
  name: string;
  userId: string;
  packetStatus: string;
  unit: string;
  arrivalAtUnit?: string;
}

export const mapToIUnitMissingPacketsSoldierData = (
  dto: IUnitMissingPacketsSoldierDataDTO,
): IUnitMissingPacketsSoldierData => {
  return {
    name: dto.name,
    userId: dto.user_id,
    packetStatus: dto.packet_status,
    unit: dto.unit,
    arrivalAtUnit: dto.arrival_at_unit,
  };
};

export interface IUnitMissingPacketsDataDTO {
  unit_name: string;
  soldiers: IUnitMissingPacketsSoldierDataDTO[];
}

export interface IUnitMissingPacketsData {
  unitName: string;
  soldiers: IUnitMissingPacketsSoldierData[];
}

export const mapToIUnitMissingPacketsData = (dto: IUnitMissingPacketsDataDTO): IUnitMissingPacketsData => {
  return {
    unitName: dto.unit_name,
    soldiers: dto.soldiers.map(mapToIUnitMissingPacketsSoldierData),
  };
};
