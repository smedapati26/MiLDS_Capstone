/**
 * camelCase
 *
 * @param {string} str
 * @returns {string} Camel cased string
 */
export const camelCase = (str: string): string => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export const camelToSnake = (str: string): string => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
