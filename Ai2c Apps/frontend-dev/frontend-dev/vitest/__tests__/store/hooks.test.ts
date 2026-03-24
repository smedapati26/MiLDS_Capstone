import { ProviderWrapper } from 'vitest/helpers/ProviderWrapper';

import { renderHook } from '@testing-library/react';

import { useAppDispatch, useAppSelector } from '@store/hooks';

describe('redux hooks', () => {
  it('should useAppDispatch return the dispatch function from the store', () => {
    const { result } = renderHook(() => useAppDispatch(), {
      wrapper: ProviderWrapper,
    });

    expect(result.current).not.toBeNull();
  });

  it('should useAppSelector return the state from the store', () => {
    const { result } = renderHook(() => useAppSelector((state) => state), {
      wrapper: ProviderWrapper,
    });

    expect(result.current).not.toBeNull();
  });
});
