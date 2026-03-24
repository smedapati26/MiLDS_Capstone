/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react-hooks';

import useFormPersist from '@hooks/useFormPersist';

describe('useFormPersist', () => {
  let storage: Storage;
  let watch: any;
  let setValue: any;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } as any;

    watch = vi.fn();
    setValue = vi.fn();
  });

  it('restores values from storage', () => {
    vi.mocked(storage.getItem).mockReturnValue(
      JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        _timestamp: Date.now(),
      }),
    );

    const onDataRestored = vi.fn();

    renderHook(() =>
      useFormPersist('form', {
        storage,
        watch,
        setValue,
        onDataRestored,
      }),
    );

    expect(setValue).toHaveBeenCalledWith('firstName', 'John', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('lastName', 'Doe', expect.any(Object));

    expect(onDataRestored).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('writes watched values to storage', () => {
    watch.mockReturnValue({ firstName: 'Alice' });

    renderHook(() =>
      useFormPersist('form', {
        storage,
        watch,
        setValue,
      }),
    );

    expect(storage.setItem).toHaveBeenCalledWith('form', JSON.stringify({ firstName: 'Alice' }));
  });

  it('excludes fields from being saved', () => {
    watch.mockReturnValue({
      firstName: 'Alice',
      password: 'secret',
    });

    renderHook(() =>
      useFormPersist('form', {
        storage,
        watch,
        setValue,
        exclude: ['password'],
      }),
    );

    expect(storage.setItem).toHaveBeenCalledWith('form', JSON.stringify({ firstName: 'Alice' }));
  });

  it('clears storage when timeout expires', () => {
    const oldTimestamp = Date.now() - 999999;

    vi.mocked(storage.getItem).mockReturnValue(
      JSON.stringify({
        firstName: 'John',
        _timestamp: oldTimestamp,
      }),
    );

    const onTimeout = vi.fn();

    renderHook(() =>
      useFormPersist('form', {
        storage,
        watch,
        setValue,
        timeout: 1000,
        onTimeout,
      }),
    );

    expect(onTimeout).toHaveBeenCalled();
    expect(storage.removeItem).toHaveBeenCalledWith('form');
  });

  it('returns a clear() function that removes storage', () => {
    const { result } = renderHook(() =>
      useFormPersist('form', {
        storage,
        watch,
        setValue,
      }),
    );

    result.current.clear();

    expect(storage.removeItem).toHaveBeenCalledWith('form');
  });
});
