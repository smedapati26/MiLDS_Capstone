/**
 * @typedef EnumOption
 * @prop { string | number } [key]
 * @prop { string } label
 * @prop { string } value
 */
export interface EnumOption {
  key?: string | number;
  label: string;
  value: string;
}
