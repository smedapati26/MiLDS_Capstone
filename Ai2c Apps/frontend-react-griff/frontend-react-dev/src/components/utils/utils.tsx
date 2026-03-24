/**
 * For every key in a, does b have the same value for that key?
 * @param a initial sync dictionary
 * @param b updated sync dictionary
 * @returns boolean
 */
export const isSubsetEqual = (a: { [key: string]: boolean }, b: { [key: string]: boolean }): boolean => {
  if (Object.keys(a).length === 0) {
    // check if {}, if {}, then all should be true
    return Object.values(b).every((v) => v === true);
  }
  return Object.keys(a).every((key) => b[key] === a[key]);
};
