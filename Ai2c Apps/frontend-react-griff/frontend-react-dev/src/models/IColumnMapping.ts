// Column mapping type
export interface IColumnMapping<T> {
  header: string;
  field: keyof T;
  width?: number | string; // Add width property
}
