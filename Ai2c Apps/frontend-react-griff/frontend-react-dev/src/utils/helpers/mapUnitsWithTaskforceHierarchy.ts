import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

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
 * @param units Array<IUnitBrief>
 * @returns Array<IUnitBrief> All units with Task Forces under a TaskForce parent
 */
export const mapUnitsWithTaskforceHierarchy = (units: Array<IUnitBrief>): IUnitBrief[] => {
  /**
   * Adding level for hierarchical structure
   * @gotcha may be an issue when adding a new TaskForce
   * @see TASK_FORCE_LEVEL_INCREMENT
   */
  const leveledUpTaskforceUnits = units
    .map((unit) => {
      const isTaskforce = unit.uic.startsWith('TF');
      const isUicAndParentUicEqual = unit.uic === unit.parentUic;

      // If Parent UIC === Parent UIC change to top level
      if (isUicAndParentUicEqual) {
        unit = { ...unit, level: TASK_FORCE_LEVEL_INCREMENT, parentUic: TASK_FORCE_TOP_LEVEL_UIC };
      }

      return {
        ...unit,
        level: isTaskforce ? unit.level + TASK_FORCE_LEVEL_INCREMENT : unit.level,
        parentUic: isTaskforce && !unit.parentUic ? TASK_FORCE_TOP_LEVEL_UIC : unit.parentUic,
      };
    })
    .filter((unit) => unit.uic !== 'TRANSIENT');

  // Combining & Sorting alphabetically on unit display name
  return [taskforceTopLevelUnit, ...leveledUpTaskforceUnits].sort((a, b) => a.displayName.localeCompare(b.displayName));
};
