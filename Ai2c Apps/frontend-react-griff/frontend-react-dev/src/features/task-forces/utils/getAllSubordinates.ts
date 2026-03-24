import { ITaskForceDetails } from '@store/griffin_api/taskforce/models/ITaskforce';

// Returns a flattened list of all of the subordinates and their descendants
export function getAllSubordinates(
  subordinates: ITaskForceDetails[],
  parentUic: string,
  level: number,
): ITaskForceDetails[] {
  let allSubordinates: ITaskForceDetails[] = [];

  for (let sub of subordinates) {
    // Update row data and add current subordinate to the list
    const updatedUnit = { ...sub.unit, parentUic: !sub.unit.parentUic ? parentUic : sub.unit.parentUic, level: level };
    sub = { ...sub, unit: updatedUnit };
    allSubordinates.push(sub);

    // Add the next level of subordinates if they exist
    if (sub.subordinates && sub.subordinates.length > 0) {
      const descendants = getAllSubordinates(sub.subordinates, sub.unit.uic, sub.unit.level + 1);
      allSubordinates = allSubordinates.concat(descendants);
    }
  }

  return allSubordinates;
}
