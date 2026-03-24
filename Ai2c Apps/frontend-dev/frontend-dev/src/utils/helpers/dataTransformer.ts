/* eslint-disable @typescript-eslint/no-explicit-any */
function toCamelCase(str: string): string {
  return str
    .replace(/([-_][a-z])/gi, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
    .replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase()); // Lowercase the first letter for single words
}

function convertToSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function mapResponseData<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((item: any) => mapResponseData(item)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: Partial<T> = {};
    Object.keys(obj as Record<string, any>).forEach((key) => {
      const camelCaseKey = toCamelCase(key);
      newObj[camelCaseKey as keyof T] = mapResponseData((obj as Record<string, any>)[key]);
    });
    return newObj as T;
  }
  return obj;
}

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S;

export type StateType<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, any> ? StateType<T[K]> : T[K];
};

function getFullMonthName(shortMonth: string) {
  const monthMapper = new Map([
    ['JAN', 'January'],
    ['FEB', 'February'],
    ['MAR', 'March'],
    ['APR', 'April'],
    ['MAY', 'May'],
    ['JUN', 'June'],
    ['JUL', 'July'],
    ['AUG', 'August'],
    ['SEP', 'September'],
    ['OCT', 'October'],
    ['NOV', 'November'],
    ['DEC', 'December'],
    ['UNK', 'Unknown'],
  ]);

  return monthMapper.get(shortMonth) ?? 'Invalid month abbreviation';
}

const determineEvaluationStatus = (evaluationStatus: string, evalDate: string) => {
  const lower = evaluationStatus.toLowerCase();
  // Birth month not set
  if (lower.includes('birth month not set')) {
    return {
      status: 'info',
      label: 'Birth Month Not Set',
    };
  }

  // In Window - Complete
  if (lower.includes('in window') && lower.includes('complete')) {
    return {
      status: 'Met',
      label: 'Met',
    };
  }

  // In Window - X Days Remaining
  if (lower.includes('in window') && lower.includes('days remaining')) {
    // eslint-disable-next-line sonarjs/slow-regex
    const match = evaluationStatus.match(/(\d+)\s*Days Remaining/i);
    const daysRemaining = match ? parseInt(match[1], 10) : null;

    return {
      status: 'warning',
      label: daysRemaining !== null ? `Due in ${daysRemaining} days` : 'Due Soon',
    };
  }

  // Not in Window - Complete
  if (lower.includes('not in window') && lower.includes('complete')) {
    return {
      status: 'Met',
      label: 'Met',
    };
  }

  // Overdue
  if (lower.includes('overdue')) {
    const evalDateObj = new Date(evalDate);
    const today = new Date();
    const msDifference = today.getTime() - evalDateObj.getTime();
    const dayDifference = Math.ceil(msDifference / (1000 * 60 * 60 * 24));

    return {
      status: 'error',
      label: `Overdue by ${dayDifference} days`,
    };
  }

  // Fallback
  return {
    status: 'info',
    label: evaluationStatus,
  };
};

export { convertToSnakeCase, determineEvaluationStatus, getFullMonthName, mapResponseData, toCamelCase };
