/**
 * slugify
 *
 * Slugifies strings
 *
 * @param { string } str
 * @returns { string } slugified-string
 */
export const slugify = (str: string): string =>
  str
    .trim()
    .replace(/[A-Z]/g, (s) => ` ${s}`)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
