import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useOwnerOptions } from '@features/task-forces/hooks/useOwnerOptions';

// Mock Redux hooks
const mockAppUser = { rankAndName: 'Lt. John Doe', userId: '123' };
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(() => mockAppUser),
}));

vi.mock('@store/slices', () => ({
  selectAppUser: vi.fn(() => mockAppUser),
}));

// Mock API hook
const mockRoles = [
  { user: { rankAndName: 'Capt. Jane Smith', userId: '456' } },
  { user: { rankAndName: 'Sgt. Bob Johnson', userId: '789' } },
  { user: { rankAndName: 'Capt. Jane Smith', userId: '456' } }, // Duplicate
];
vi.mock('@store/griffin_api/users/slices', () => ({
  useGetRolesQuery: vi.fn(() => ({ data: mockRoles })),
}));

describe('useOwnerOptions', () => {
  it('returns deduplicated user options from roles', () => {
    const { result } = renderHook(() => useOwnerOptions());

    expect(result.current).toEqual([
      { label: 'Capt. Jane Smith', value: '456' },
      { label: 'Sgt. Bob Johnson', value: '789' },
    ]);
  });

  it('memoizes the options correctly', () => {
    const { result, rerender } = renderHook(() => useOwnerOptions());

    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult); // Same reference due to memoization
  });
});
