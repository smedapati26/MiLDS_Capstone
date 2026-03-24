import { Echelon } from '@ai2c/pmx-mui';

/* Represents auto daily status report units  DTO */
export interface IUnitBriefDto {
  uic: string;
  echelon: Echelon;
  component: string;
  level: number;
  short_name: string;
  display_name: string;
  nick_name: string | null;
  state: string | null;
  parent_unit: string | null;
}

/* Represents auto daily status report units */
export interface IUnitBrief {
  uic: string;
  echelon: Echelon;
  component: string;
  level: number;
  displayName: string;
  shortName: string;
  nickName?: string;
  state?: string;
  parentUic?: string;
}

export interface IUnitDto {
  uic: string;
  short_name: string;
  display_name: string;
  mos_skill_levels: Record<string, string[]>;
}

export interface IUnitHierarchyDto {
  parent_unit: IUnitDto;
  target_unit: IUnitDto;
  child_units: IUnitDto[];
}

export interface IUnit {
  uic: string;
  shortName: string;
  displayName: string;
  mosSkillLevels: Record<string, string[]>;
}

export interface IUnitHierarchy {
  parentUnit: IUnit;
  targetUnit: IUnit;
  childUnits: IUnit[];
}

/**
 * Maps an IUnitBriefDto object to an IUnitBrief object.
 *
 * @param dto - The data transfer object containing the properties to map.
 * @returns An IUnitBrief object with the mapped properties.
 */
export const mapToIUnitBrief = (dto: IUnitBriefDto): IUnitBrief => ({
  uic: dto.uic,
  echelon: dto.echelon,
  component: dto.component,
  level: dto.level,
  displayName: dto.display_name,
  shortName: dto.short_name,
  nickName: dto.nick_name ?? undefined,
  state: dto.state ?? undefined,
  parentUic: dto.parent_unit ?? undefined,
});
