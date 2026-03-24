/**
 * titlecase
 *
 * Title cases strings
 *
 * @param { string } str
 * @returns { string } Title Cased String
 */
export const titlecase = (str: string): string =>
  str
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .replace(/^-+|-+$/g, ' ')
    .split(' ')
    .map((l: string) => l[0].toUpperCase() + l.substring(1))
    .join(' ');

/**
 * titlecase
 *
 * Title cases strings
 *
 * @param { string } str
 * @returns { string } Title Cased String
 */
export const titlecaseAcronym = (str: string): string =>
  !str
    ? ''
    : str
        .trim()
        .toLocaleLowerCase()
        .replace(/[\s_-]+/g, ' ')
        .replace(/^-+|-+$/g, ' ')
        .split(' ')
        .map((l: string) => l[0].toUpperCase())
        .join('');
