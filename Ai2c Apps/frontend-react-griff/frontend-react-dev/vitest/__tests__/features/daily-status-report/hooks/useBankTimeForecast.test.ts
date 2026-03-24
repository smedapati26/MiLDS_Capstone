import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useBankTimeCalculations } from '@features/daily-status-report/hooks/useBankTimeCalculations';
import { useBankTimeForecast } from '@features/daily-status-report/hooks/useBankTimeForecast';

import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';
import { useGetBankTimeQuery } from '@store/griffin_api/auto_dsr/slices';

// Mock the dependencies
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetBankTimeQuery: vi.fn(),
}));

vi.mock('@features/daily-status-report/hooks/useBankTimeCalculations', () => ({
  useBankTimeCalculations: vi.fn(),
}));

// Mock data for testing
const mockBankTimeData: IBankTimeForecast[] = [
  {
    model: 'CH-47F',
    projections: [
      { date: '2025-02-15', value: 80 },
      { date: '2025-03-15', value: 75 },
    ],
  },
  {
    model: 'UH-60M',
    projections: [
      { date: '2025-02-15', value: 60 },
      { date: '2025-03-15', value: 65 },
    ],
  },
];

const mockCalculations = {
  percentage: 0.7,
  projectedDifference: -5,
};

describe('useBankTimeForecast', () => {
  const mockUseGetBankTimeQuery = useGetBankTimeQuery as unknown as ReturnType<typeof vi.fn>;
  const mockUseBankTimeCalculations = useBankTimeCalculations as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockUseBankTimeCalculations.mockReturnValue(mockCalculations);
  });

  describe('when uic parameter is empty', () => {
    beforeEach(() => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });
    });

    it('should skip the query and return default values', () => {
      const { result } = renderHook(() => useBankTimeForecast(''));

      // Verify query was called with skip: true
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: '' }, { skip: true });

      // Verify calculations hook was called with undefined data
      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(undefined);

      // Verify returned values
      expect(result.current).toEqual({
        percentage: 0.7,
        projectedDifference: -5,
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: expect.any(Function),
      });
    });
  });

  describe('when uic parameter is provided', () => {
    const testUic = 'TEST_UIC_123';

    it('should fetch data successfully and return calculated values', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      // Verify query was called with correct parameters
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: testUic }, { skip: false });

      // Verify calculations hook was called with fetched data
      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(mockBankTimeData);

      // Verify returned values
      expect(result.current).toEqual({
        percentage: 0.7,
        projectedDifference: -5,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: expect.any(Function),
      });
    });

    it('should handle loading state correctly', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: true,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.isFetching).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Verify calculations hook was called with undefined data during loading
      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(undefined);
    });

    it('should handle error state correctly', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Verify calculations hook was called with undefined data during error
      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(undefined);
    });

    it('should handle uninitialized state correctly', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.isUninitialized).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should provide refetch functionality', () => {
      const mockRefetch = vi.fn();
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });

  describe('when uic parameter changes', () => {
    it('should update query parameters when uic changes', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      const { rerender } = renderHook(({ uic }) => useBankTimeForecast(uic), {
        initialProps: { uic: '' },
      });

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: '' }, { skip: true });

      // Update to valid UIC
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      rerender({ uic: 'NEW_UIC' });

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: 'NEW_UIC' }, { skip: false });
    });

    it('should skip query when uic changes from valid to empty', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderHook(({ uic }) => useBankTimeForecast(uic), {
        initialProps: { uic: 'VALID_UIC' },
      });

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: 'VALID_UIC' }, { skip: false });

      // Change to empty UIC
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      rerender({ uic: '' });

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: '' }, { skip: true });
    });
  });

  describe('integration with useBankTimeCalculations', () => {
    const testUic = 'TEST_UIC';

    it('should pass fetched data to calculations hook', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderHook(() => useBankTimeForecast(testUic));

      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(mockBankTimeData);
    });

    it('should pass undefined to calculations hook when no data', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: true,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderHook(() => useBankTimeForecast(testUic));

      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(undefined);
    });

    it('should return calculations results in hook output', () => {
      const customCalculations = {
        percentage: 0.85,
        projectedDifference: 10,
      };

      mockUseBankTimeCalculations.mockReturnValue(customCalculations);
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.percentage).toBe(0.85);
      expect(result.current.projectedDifference).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      const emptyData: IBankTimeForecast[] = [];
      const testUic = 'TEST_UIC';

      mockUseGetBankTimeQuery.mockReturnValue({
        data: emptyData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(mockUseBankTimeCalculations).toHaveBeenCalledWith(emptyData);
      expect(result.current.data).toEqual(emptyData);
    });

    it('should handle null uic gracefully', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(null as unknown as string));

      // When uic is null, skip should be false (not equal to empty string)
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: null }, { skip: false });

      expect(result.current.data).toBeUndefined();
    });

    it('should handle undefined uic gracefully', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderHook(() => useBankTimeForecast(undefined as unknown as string));

      // When uic is undefined, skip should be false (not equal to empty string)
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: undefined }, { skip: false });
    });

    it('should handle whitespace-only uic', () => {
      const whitespaceUic = '   ';
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderHook(() => useBankTimeForecast(whitespaceUic));

      // Whitespace-only string is not empty, so skip should be false
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: whitespaceUic }, { skip: false });
    });
  });

  describe('memoization and performance', () => {
    const testUic = 'TEST_UIC';

    it('should maintain stable references when data does not change', () => {
      const mockRefetch = vi.fn();
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      const { result, rerender } = renderHook(() => useBankTimeForecast(testUic));

      const firstResult = result.current;

      // Rerender without changing any dependencies
      rerender();

      const secondResult = result.current;

      // The refetch function should be the same reference
      expect(firstResult.refetch).toBe(secondResult.refetch);
      expect(firstResult.data).toBe(secondResult.data);
    });

    it('should call useBankTimeCalculations on every render', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderHook(() => useBankTimeForecast(testUic));

      expect(mockUseBankTimeCalculations).toHaveBeenCalledTimes(1);

      // Rerender without changing data
      rerender();

      // useBankTimeCalculations should be called again (it's called on every render)
      // but with the same data reference
      expect(mockUseBankTimeCalculations).toHaveBeenCalledTimes(2);
      expect(mockUseBankTimeCalculations).toHaveBeenNthCalledWith(1, mockBankTimeData);
      expect(mockUseBankTimeCalculations).toHaveBeenNthCalledWith(2, mockBankTimeData);
    });
  });

  describe('query skip logic', () => {
    it('should skip query when uic is exactly empty string', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderHook(() => useBankTimeForecast(''));

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: '' }, { skip: true });
    });

    it('should not skip query when uic is any non-empty string', () => {
      const testCases = ['a', 'TEST_UIC', '123', ' ', 'null', 'undefined'];

      testCases.forEach((uic) => {
        vi.clearAllMocks();
        mockUseGetBankTimeQuery.mockReturnValue({
          data: undefined,
          isError: false,
          isFetching: false,
          isUninitialized: false,
          refetch: vi.fn(),
        });

        renderHook(() => useBankTimeForecast(uic));

        expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic }, { skip: false });
      });
    });
  });

  describe('return value structure', () => {
    const testUic = 'TEST_UIC';

    it('should return all expected properties', () => {
      const mockRefetch = vi.fn();
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current).toHaveProperty('percentage');
      expect(result.current).toHaveProperty('projectedDifference');
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isFetching');
      expect(result.current).toHaveProperty('isUninitialized');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should return correct types for all properties', () => {
      const mockRefetch = vi.fn();
      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(typeof result.current.percentage).toBe('number');
      expect(typeof result.current.projectedDifference).toBe('number');
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(typeof result.current.isError).toBe('boolean');
      expect(typeof result.current.isFetching).toBe('boolean');
      expect(typeof result.current.isUninitialized).toBe('boolean');
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('error scenarios', () => {
    const testUic = 'TEST_UIC';

    it('should handle query error with proper error state', () => {
      mockUseGetBankTimeQuery.mockReturnValue({
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useBankTimeForecast(testUic));

      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isUninitialized).toBe(false);
    });

    it('should handle calculations hook throwing error gracefully', () => {
      mockUseBankTimeCalculations.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      expect(() => {
        renderHook(() => useBankTimeForecast(testUic));
      }).toThrow('Calculation error');
    });
  });

  describe('hook parameter validation', () => {
    it('should work with different UIC formats', () => {
      const testCases = [
        'ABC123',
        'unit-123',
        'UNIT_WITH_UNDERSCORES',
        '12345',
        'a',
        'VERY_LONG_UIC_NAME_WITH_MANY_CHARACTERS',
      ];

      testCases.forEach((uic) => {
        vi.clearAllMocks();
        mockUseGetBankTimeQuery.mockReturnValue({
          data: mockBankTimeData,
          isError: false,
          isFetching: false,
          isUninitialized: false,
          refetch: vi.fn(),
        });

        const { result } = renderHook(() => useBankTimeForecast(uic));

        expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic }, { skip: false });
        expect(result.current.data).toBe(mockBankTimeData);
      });
    });
  });

  describe('concurrent hook usage', () => {
    it('should handle multiple hook instances with different UICs', () => {
      const uic1 = 'UIC_1';
      const uic2 = 'UIC_2';

      mockUseGetBankTimeQuery.mockReturnValue({
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { result: result1 } = renderHook(() => useBankTimeForecast(uic1));
      const { result: result2 } = renderHook(() => useBankTimeForecast(uic2));

      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: uic1 }, { skip: false });
      expect(mockUseGetBankTimeQuery).toHaveBeenCalledWith({ uic: uic2 }, { skip: false });

      expect(result1.current.data).toBe(mockBankTimeData);
      expect(result2.current.data).toBe(mockBankTimeData);
    });
  });
});
