import { describe, expect, it } from 'vitest';

import { IPagedData } from '@models/IPagedData';

describe('IPagedData', () => {
  it('should create an IPagedData object with items and count', () => {
    const pagedData: IPagedData<string> = {
      items: ['item1', 'item2', 'item3'],
      count: 3,
    };

    expect(pagedData.items).toEqual(['item1', 'item2', 'item3']);
    expect(pagedData.count).toBe(3);
  });

  it('should handle an empty items array', () => {
    const pagedData: IPagedData<string> = {
      items: [],
      count: 0,
    };

    expect(pagedData.items).toEqual([]);
    expect(pagedData.count).toBe(0);
  });

  it('should handle different types of items', () => {
    const pagedData: IPagedData<number> = {
      items: [1, 2, 3],
      count: 3,
    };

    expect(pagedData.items).toEqual([1, 2, 3]);
    expect(pagedData.count).toBe(3);
  });
});
