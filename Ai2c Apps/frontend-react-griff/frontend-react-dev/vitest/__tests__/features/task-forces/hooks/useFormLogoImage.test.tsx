/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { useFormLogoImage } from '@features/task-forces/hooks/useFormLogoImage';

// Mock react-hook-form
const mockGetValues = vi.fn();
vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    getValues: mockGetValues,
  }),
}));

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  onload: null as any,
  result: 'mock-data-url',
};
global.FileReader = vi.fn(() => mockFileReader) as any;

describe('useFormLogoImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValues.mockClear();
  });

  it('returns null when no file is present', () => {
    mockGetValues.mockReturnValue(null);

    const { result } = renderHook(() => useFormLogoImage('logo'));

    expect(result.current).toBeNull();
    expect(mockGetValues).toHaveBeenCalledWith('logo');
  });

  it('returns the string value directly if file is a string', () => {
    const mockDataURL = 'data:image/png;base64,...';
    mockGetValues.mockReturnValue(mockDataURL);

    const { result } = renderHook(() => useFormLogoImage('logo'));

    expect(result.current).toBe(mockDataURL);
    expect(mockGetValues).toHaveBeenCalledWith('logo');
  });

  it('converts File to data URL using FileReader', async () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    mockGetValues.mockReturnValue(mockFile);

    const { result } = renderHook(() => useFormLogoImage('logo'));

    // Initially null
    expect(result.current).toBeNull();

    // Simulate FileReader onload
    mockFileReader.onload();

    await waitFor(() => {
      expect(result.current).toBe('mock-data-url');
    });

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('uses the provided fieldName', () => {
    mockGetValues.mockReturnValue(null);

    renderHook(() => useFormLogoImage('customField'));

    expect(mockGetValues).toHaveBeenCalledWith('customField');
  });
});
