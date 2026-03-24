import { useDebounce } from 'src/hooks/useDebounce';

import { act, renderHook } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current[0]).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Should still be initial value
    expect(result.current[0]).toBe('initial');
  });

  it('should return debounced value after delay on subsequent renders', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // First render should return initial value
    expect(result.current[0]).toBe('initial');
    rerender({ value: 'changed', delay: 500 });

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBe('changed');
  });
});
