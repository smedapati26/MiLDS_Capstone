import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

/**
 * filterUnitsHierarchy
 *
 * Filters out targetUnits specified as well as their parent and subordinate units in tree unit hierarchy
 *
 * @param units Array<IUnitBrief> Array of all units
 * @param targetUnits Array<IUnitBrief> Array of units to be filtered
 * @returns Array<IUnitBrief> Tree of just targetUnits and their descendents and ancestors
 */
export const filterUnitsHierarchy = (units: IUnitBrief[], targetUnits: IUnitBrief[]): IUnitBrief[] => {
  const lookup = new Map(units.map((unit) => [unit.uic, unit]));
  const keep = new Set<string>();

  // Build map for subordinate unit traversal
  const subordinateUnitMap = new Map<string, IUnitBrief[]>();
  for (const unit of units) {
    if (!unit.parentUic) continue;
    if (!subordinateUnitMap.has(unit.parentUic)) {
      subordinateUnitMap.set(unit.parentUic, []);
    }
    subordinateUnitMap.get(unit.parentUic)!.push(unit);
  }

  // Add target units to filter out
  targetUnits.forEach((unit) => keep.add(unit.uic));

  // Add parent units
  for (const unit of targetUnits) {
    let current = lookup.get(unit.uic);
    while (current && current.parentUic) {
      if (keep.has(current.parentUic)) break;
      keep.add(current.parentUic);
      current = lookup.get(current.parentUic);
    }
  }

  // Add subordinate units
  const stack = [...targetUnits];
  while (stack.length > 0) {
    const unit = stack.pop()!;
    keep.add(unit.uic);

    const children = subordinateUnitMap.get(unit.uic);
    if (!children) continue;

    for (const child of children) {
      if (!keep.has(child.uic)) {
        keep.add(child.uic);
        stack.push(child);
      }
    }
  }

  // Return filtered unit tree (still flat array)
  return units.filter((unit) => keep.has(unit.uic));
};
