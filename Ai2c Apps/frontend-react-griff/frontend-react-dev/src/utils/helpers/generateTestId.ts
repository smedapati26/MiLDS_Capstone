/**
 * generateTestId
 *
 * @param label test id label
 * @param postFix prefixes id
 * @param isPrefix postfixes id when true
 * @returns string - testId
 */
export const generateTestId = (
  label: string | undefined,
  postFix?: string | null | undefined,
  isPrefix?: boolean,
): string | null => {
  if (import.meta.env.NODE_ENV !== 'test') return null;

  let testId = label ? label.trim().replace(/\s+/g, '-').toLowerCase() : null;

  if (postFix) {
    testId = isPrefix ? `${postFix}-${testId}` : `${testId}-${postFix}`;
  }

  return testId;
};
