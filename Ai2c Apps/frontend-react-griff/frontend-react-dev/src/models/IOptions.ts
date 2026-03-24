/**
 * Represents an option used im MUI components.
 */
export interface IOptions {
  label: string;
  value: string;
  key?: string;
}

/**
 * Represents Options for MUI components where you can specify the type
 */
export interface IOptionType<TValue> {
  label: string;
  value: TValue;
  key?: string;
}
