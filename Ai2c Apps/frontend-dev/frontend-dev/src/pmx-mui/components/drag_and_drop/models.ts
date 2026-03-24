export const DROP_TYPE = 'draggable-item';

/* Drop Location Enum */
export enum DropLocationEnum {
  TOP = 'top',
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right',
}

/**
 * @typedef DropItem
 * @prop { string | number } id
 * @prop { DropLocation | string} location
 * @prop { T } item
 */
export type DropItem<T> = {
  id: string | number;
  location: DropLocationEnum | string;
  item: T;
};
