import { describe, expect, it, vi } from 'vitest';

import { useDebounce } from '@hooks/useDebounce';
import { act, renderHook } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));

    expect(result.current[0]).toBe('hello');
  });

  it('updates the debounced value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } });

    // Initial render returns immediate value
    expect(result.current[0]).toBe('a');

    // Change the value
    rerender({ value: 'b' });

    // Fast‑forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now debounced value updates
    expect(result.current[0]).toBe('b');
  });

  it('cleans up previous timers when value changes', () => {
    const clearSpy = vi.spyOn(global, 'clearTimeout');

    const { rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'x' } });

    rerender({ value: 'y' });

    expect(clearSpy).toHaveBeenCalled();
  });
});
