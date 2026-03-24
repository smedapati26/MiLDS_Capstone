import { Echelon } from '@ai2c/pmx-mui';

import { IUnitBrief } from '@store/amap_ai/units/models';

export const TASK_FORCE_TOP_LEVEL_UIC = 'taskforce_top_level_parent';
export const TASK_FORCE_LEVEL_INCREMENT = 1; // Constant because it may be a GOTCHA when adding a new TaskForce

// This is a top level Taskforce Unit to group all taskforces under
export const taskforceTopLevelUnit = {
  uic: TASK_FORCE_TOP_LEVEL_UIC,
  parentUic: undefined,
  echelon: Echelon.TASK_FORCE,
  component: 'TF',
  level: 0,
  displayName: 'Task Forces',
  shortName: 'Task Forces',
  nickName: 'Task Forces',
};

/**
 * mapUnitsWithTaskforceHierarchy
 *
 * Maps/groups taskforce units under a single parent and sorts alphabetically by units display name
 *
 * @param units Array<IUnitBriefDto>
 * @returns Array<IUnitBrief> All units with Taskforces under a TaskForce parent
 */
export const mapUnitsWithTaskforceHierarchy = (units: Array<IUnitBrief>) => {
  /**
   * Adding level for hierarchical structure
   * @gotcha may be an issue when adding a new TaskForce
   * @see TASK_FORCE_LEVEL_INCREMENT
   */
  const leveledUpTaskforceUnits = units.map((unit) => {
    const isTaskforce = unit.uic.startsWith('TF');

    return {
      ...unit,
      level: isTaskforce ? unit.level + TASK_FORCE_LEVEL_INCREMENT : unit.level,
      parentUic: isTaskforce && !unit.parentUic ? TASK_FORCE_TOP_LEVEL_UIC : unit.parentUic,
    };
  });

  // Combining & Sorting alphabetically on unit display name
  return [taskforceTopLevelUnit, ...leveledUpTaskforceUnits].sort((a, b) =>
    a.displayName?.localeCompare(b.displayName),
  );
};
