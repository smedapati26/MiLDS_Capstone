import { Echelon } from './Echelon';

/**
 * @typedef UnitDto
 * @prop
 */
export interface UnitDto {
  uic: string;
  short_name: string;
  display_name: string;
  nick_name: string | null;
  echelon: Echelon | string;
  compo: string;
  state?: string | null;
  parent_uic: string | null;
  level: number;
}

/**
 * @typedef Unit
 * @prop
 */
export interface Unit {
  uic: string;
  shortName: string;
  displayName: string;
  nickname: string | null;
  echelon: Echelon | string;
  component: string;
  state?: string | null;
  parentUic: string | undefined;
  level: number;
}

/**
 * mapUnitDtoToUnit
 *
 * Map Unit Api DTO response to Unit Model
 *
 * @param { UnitDto } dto API response
 * @return { Unit } Local model
 */
export const mapUnitDtoToUnit = (dto: UnitDto): Unit => {
  return {
    uic: dto.uic,
    parentUic: dto.parent_uic ?? '',
    displayName: dto.display_name,
    shortName: dto.short_name,
    nickname: dto.nick_name,
    echelon: dto.echelon,
    component: dto.compo,
    state: dto.state,
    level: dto.level,
  };
};
