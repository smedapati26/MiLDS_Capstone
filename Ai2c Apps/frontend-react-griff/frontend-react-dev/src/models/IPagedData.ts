/**
 * Represents a paginated data structure from Ninja API.
 *
 * @template T - The type of the items in the paginated data.
 */
export interface IPagedData<T> {
  items: Array<T>;
  count: number;
}
