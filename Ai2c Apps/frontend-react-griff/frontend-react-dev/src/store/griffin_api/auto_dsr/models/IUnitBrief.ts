import { Echelon } from '@ai2c/pmx-mui/models';

export interface IUnitBasic {
  uic: string;
  short_name: string;
  display_name: string;
  nick_name: string | null;
  echelon: Echelon;
  level: number;
}
// Represents a unit
export interface IUnitBasicSUnits extends IUnitBasic {
  parent_uic: string;
}

/* Represents auto daily status report units  DTO */
export interface IUnitBriefDto extends IUnitBasic {
  component: string;
  state: string | null;
  parent_uic: string | null;
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
  parentUic: dto.parent_uic ?? undefined,
});

/* Creating reusable empty unit variable */
export const emptyUnit: IUnitBriefDto = {
  uic: '',
  short_name: '',
  display_name: '',
  nick_name: '',
  echelon: Echelon.UNKNOWN,
  component: '',
  parent_uic: '',
  state: '',
  level: 0,
};
