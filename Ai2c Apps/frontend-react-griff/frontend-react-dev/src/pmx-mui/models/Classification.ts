import { EnumOption } from './EnumOption';

/* Classification Enum */
export enum Classification {
  UNCLASSIFIED = 'Unclassified',
  CUI = 'CUI',
  CONFIDENTIAL = 'Confidential',
  SECRET = 'Secret',
  TOP_SECRET = 'Top Secret',
  TOP_SECRET_SCI = 'Top Secret // SCI',
}

/* Get Classification options */
export const getClassificationOptions = Object.entries(Classification).map(
  ([label, value]): EnumOption => ({
    label,
    value,
  }),
);
