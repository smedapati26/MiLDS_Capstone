import { IUnit, IUnitHierarchy } from '@store/amap_ai/units/models';

export const mapUnitToOrgNode = (unit?: IUnit) => {
  if (!unit) {
    return { id: '', name: '', title: '', children: [], metaData: [] };
  }

  return {
    id: unit.uic ?? '',
    name: unit.shortName ?? '',
    title: unit.shortName ?? '',
    metaData: unit.mosSkillLevels
      ? Object.entries(unit.mosSkillLevels).map(([mos, levels]) => ({
          id: mos,
          name: mos,
          children: levels.map((level) => ({
            id: level,
            name: level,
          })),
        }))
      : [],
  };
};

export const buildOrgChartData = (hierarchy: IUnitHierarchy) => {
  const parent = mapUnitToOrgNode(hierarchy.targetUnit);
  const children = Array.isArray(hierarchy.childUnits) ? hierarchy.childUnits.map(mapUnitToOrgNode) : [];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  parent.children = children;
  const grandparent = mapUnitToOrgNode(hierarchy.parentUnit);

  return { parent, grandparent };
};
