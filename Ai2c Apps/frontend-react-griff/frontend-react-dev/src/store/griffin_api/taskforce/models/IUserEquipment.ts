import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

interface IBase {
  model: string;
  current_unit__short_name: string;
}

// Represents task_force/user-equipment GET request aircraft array DTO object
export interface IAircraftDto extends IBase {
  serial: string;
  status: string | OperationalReadinessStatusEnum;
}
// Represents task_force/user-equipment GET request UAS array DTO object
export interface IUasDto extends IBase {
  serial_number: string;
  status: string | OperationalReadinessStatusEnum;
}
// Represents task_force/user-equipment GET request AGSE array DTO object
export interface IAgseDto extends IBase {
  equipment_number: string;
  condition: string | OperationalReadinessStatusEnum;
}

// Single equipment output interface
export interface IUserEquipment {
  serial: string;
  model: string;
  unit: string;
  status: string | OperationalReadinessStatusEnum;
}

// Maps DTO to state interface
export const mapToIUserEquipment = (dto: IAircraftDto | IUasDto | IAgseDto): IUserEquipment => {
  let serial: string;
  let status: string | OperationalReadinessStatusEnum;

  if ('serial' in dto) {
    // IAircraftDto
    serial = dto.serial;
    status = dto.status;
  } else if ('serial_number' in dto) {
    // IUasDto
    serial = dto.serial_number;
    status = dto.status;
  } else if ('equipment_number' in dto) {
    // IAgseDto
    serial = dto.equipment_number;
    status = dto.condition;
  } else {
    throw new Error('Unknown DTO type');
  }

  return {
    serial,
    model: dto.model,
    unit: dto.current_unit__short_name,
    status,
  };
};

// Represents DTO from task_force/user-equipment GET request
export interface IUserEquipmentsDto {
  aircraft: IAircraftDto[];
  uas: IUasDto[];
  agse: IAgseDto[];
}
// Mapped interface
export interface IUserEquipments {
  aircraft: IUserEquipment[];
  uas: IUserEquipment[];
  agse: IUserEquipment[];
}

/* Maps taskforce user equipment DTO to state interface */
export const mapToUserEquipments = (dto: IUserEquipmentsDto): IUserEquipments => {
  return {
    aircraft: dto.aircraft.map(mapToIUserEquipment),
    uas: dto.uas.map(mapToIUserEquipment),
    agse: dto.agse.map(mapToIUserEquipment),
  };
};
