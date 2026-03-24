/**
 * Normalizes a date by setting its time to the start of the day (00:00:00).
 */
function formatDateToMidnight(dateInput: string | Date) {
  let date = new Date(dateInput);

  // update date to fix timezone parsing to use local date if string type
  if (typeof dateInput === 'string') {
    const localDateString = dateInput.split('T')[0].replace(/-/g, '/');
    date = new Date(localDateString);
  }

  // set the time to midnight.
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Checks if date A is the same date or a date occurring after date B
 */
export function isSameOrAfter(dateA: string, dateB: string) {
  const formattedDateA = formatDateToMidnight(dateA);
  const formattedDateB = formatDateToMidnight(dateB);
  return formattedDateA && formattedDateB ? formattedDateA >= formattedDateB : false;
}

/**
 * Checks if date A is the same date or a date occurring before date B
 */
export function isSameOrBefore(dateA: string, dateB: string) {
  const formattedDateA = formatDateToMidnight(dateA);
  const formattedDateB = formatDateToMidnight(dateB);
  return formattedDateA && formattedDateB ? formattedDateA <= formattedDateB : false;
}

/**
 * Returns the nested property from an object using a string path.
 * Used for accessing fields for the search query functionality
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedField(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
