import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';
import { getSerialNumbers } from '@features/task-forces/utils/getSerialNumbers';

/* Update DTO Taskforce Interface for Subordinate Taskforces */
export interface ITaskforceUpdateUnitSubordinateDto {
  uic: string;
  tf_name: string;
  echelon: string;
  short_name: string;
  nick_name?: string;
  owner_user_id: string;
  subordinates: Array<ITaskforceUpdateUnitSubordinateDto>;
}

/**
 * ITaskforceUpdateUnitDto
 * Represents Taskforce Data Transfer Object for Updating Units
 */
export interface ITaskforceUpdateUnitDto extends ITaskforceUpdateUnitSubordinateDto {
  slogan?: string;
  location_id: number;
  tf_start_date: string | Date;
  tf_end_date: string | Date;
}

/**
 * ITaskforceUpdateEquipmentSubordinateDto
 * Represents Taskforce Data Transfer Object for Updating Equipment
 */
export interface ITaskforceUpdateEquipmentSubordinateDto {
  uic: string;
  tf_name: string;
  aircraft: Array<string>;
  uas: Array<string>;
  agse: Array<string>;
  subordinates: Array<ITaskforceUpdateEquipmentSubordinateDto>;
}

/**
 * ITaskforceUpdateUnitResult
 * Represents result returned from updating Task Force Unit data
 */
export interface ITaskforceUpdateUnitResult {
  overall_success: boolean;
  message: string;
  total_attempted: number;
  total_updated: number;
  total_failed: number;
  results: [
    {
      tf_name: string;
      uic?: string;
      success: boolean;
      error?: string;
      updated_fields: string[];
      level: number;
    },
  ];
}

// Maps SubordinateSchemaType to ITaskforceUpdateUnitSubordinateDto
export const mapToITaskforceUpdateUnitSubordinateDto = (
  subordinate: SubordinateSchemaType,
): ITaskforceUpdateUnitSubordinateDto => {
  return {
    uic: subordinate.uuid,
    tf_name: subordinate.name,
    echelon: subordinate.echelon,
    short_name: subordinate.shortname,
    owner_user_id: subordinate.ownerId,
    nick_name: subordinate.nickname,
    subordinates: [],
  };
};

// Maps SubordinateSchemaType to ITaskforceUpdateEquipmentSubordinateDto
export const mapToITaskforceUpdateEquipmentSubordinateDto = (
  subordinate: SubordinateSchemaType,
): ITaskforceUpdateEquipmentSubordinateDto => {
  return {
    uic: subordinate.uuid,
    tf_name: subordinate.name,
    aircraft: getSerialNumbers(subordinate.aircraft),
    uas: getSerialNumbers(subordinate.uas),
    agse: getSerialNumbers(subordinate.agse),
    subordinates: [],
  };
};
