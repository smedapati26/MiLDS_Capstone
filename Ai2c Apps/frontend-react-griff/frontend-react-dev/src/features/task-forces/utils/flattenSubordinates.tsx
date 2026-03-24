import { ITaskForceDetails, mapToSubordinateSchemaType } from '@store/griffin_api/taskforce/models/ITaskforce';

import { SubordinateSchemaType } from '../components/create-stepper/step 2/schema';

/**
 * Flattens a tree of subordinates into a single array.
 * @param subs - The array of subordinates from the taskforce.
 * @returns A single, flat array containing every node from the hierarchy.
 */
export const flattenSubordinates = (subs: ITaskForceDetails[]): SubordinateSchemaType[] => {
  const flatSubordinates: ITaskForceDetails[] = [];

  // A recursive helper function to traverse the tree
  const flatten = (sub: ITaskForceDetails) => {
    flatSubordinates.push({
      ...sub,
      subordinates: [],
    });

    // 2. If the node has children, recursively call traverse on each of them.
    if (sub.subordinates && sub.subordinates.length > 0) {
      for (const child of sub.subordinates) {
        flatten(child);
      }
    }
  };

  // Start the traversal for each root node in the initial array
  for (const topLevelSub of subs) {
    flatten(topLevelSub);
  }

  return flatSubordinates.map(mapToSubordinateSchemaType);
};
