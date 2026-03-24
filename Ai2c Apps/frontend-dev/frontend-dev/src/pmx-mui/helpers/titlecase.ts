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
    // eslint-disable-next-line sonarjs/slow-regex, sonarjs/anchor-precedence
    .replace(/^-+|-+$/g, ' ')
    .split(' ')
    .map((l: string) => l[0].toUpperCase() + l.substring(1))
    .join(' ');
