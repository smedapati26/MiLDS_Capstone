import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { renderHook } from '@testing-library/react';

import useOrStatusColor from '@hooks/useOrStatusColor';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

import '@testing-library/jest-dom';

// Mock theme with operational readiness status colors
const mockTheme = createTheme({
  palette: { ...mockPalette },
});

const createWrapper = (theme = mockTheme) => {
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  WrapperComponent.displayName = 'ThemeWrapper';
  return WrapperComponent;
};

describe('useOrStatusColor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Operational Readiness Status Colors', () => {
    it('returns correct color for FMC status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);
    });

    it('returns correct color for PMCS status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.PMCS), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.pmcs);
    });

    it('returns correct color for PMCM status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.PMCM), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.pmcm);
    });

    it('returns correct color for NMCS status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.NMCS), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.nmcs);
    });

    it('returns correct color for DADE status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.DADE), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.dade);
    });
  });

  describe('NMCM Group Colors', () => {
    it('returns NMCM color for NMCM status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.NMCM), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.nmcm);
    });

    it('returns NMCM color for NMC status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.NMC), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.nmcm);
    });

    it('returns NMCM color for SUST status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.SUST), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.nmcm);
    });

    it('returns NMCM color for FIELD status', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.FIELD), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.nmcm);
    });
  });

  describe('Default and Unknown Status Colors', () => {
    it('returns default color for unknown string key', () => {
      const { result } = renderHook(() => useOrStatusColor('UNKNOWN_STATUS'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });

    it('returns default color for MTF status (not handled in switch)', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.MTF), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });

    it('returns default color for MOC status (not handled in switch)', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.MOC), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });

    it('returns default color for UNK status (not handled in switch)', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.UNK), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });

    it('returns default color for empty string', () => {
      const { result } = renderHook(() => useOrStatusColor(''), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });
  });

  describe('Hook Functionality', () => {
    it('updates color when key changes', () => {
      const { result, rerender } = renderHook(({ key }) => useOrStatusColor(key), {
        wrapper: createWrapper(),
        initialProps: { key: OperationalReadinessStatusEnum.FMC },
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);

      rerender({ key: OperationalReadinessStatusEnum.PMCS });

      expect(result.current).toBe(mockPalette.operational_readiness_status.pmcs);
    });
  });

  describe('Performance and Optimization', () => {
    it('properly cleans up effect when component unmounts', () => {
      const { result, unmount } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);

      // Unmounting should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('re-evaluates color when dependencies change', () => {
      const { result, rerender } = renderHook(({ key }) => useOrStatusColor(key), {
        wrapper: createWrapper(),
        initialProps: { key: OperationalReadinessStatusEnum.FMC },
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);

      // Change key to trigger useEffect
      rerender({ key: OperationalReadinessStatusEnum.PMCS });
      expect(result.current).toBe(mockPalette.operational_readiness_status.pmcs);

      // Change back to original key
      rerender({ key: OperationalReadinessStatusEnum.FMC });
      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);
    });
  });

  describe('Type Safety', () => {
    it('accepts OperationalReadinessStatusEnum values', () => {
      const { result } = renderHook(() => useOrStatusColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);
    });

    it('accepts string values', () => {
      const { result } = renderHook(() => useOrStatusColor('custom-string'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe('#FFFFFFB3');
    });
  });

  describe('Integration with MUI Theme', () => {
    it('correctly reads from theme.palette.text.secondary for default', () => {
      const customTheme = createTheme({
        ...mockTheme,
        palette: {
          ...mockTheme.palette,
          text: {
            ...mockTheme.palette.text,
            secondary: '#CUSTOM_SECONDARY',
          },
        },
      });

      const { result } = renderHook(() => useOrStatusColor('unknown'), {
        wrapper: createWrapper(customTheme),
      });

      expect(result.current).toBe('#CUSTOM_SECONDARY');
    });
  });

  describe('useEffect Dependencies', () => {
    it('responds to key changes', () => {
      const { result, rerender } = renderHook(({ key }) => useOrStatusColor(key), {
        wrapper: createWrapper(),
        initialProps: { key: OperationalReadinessStatusEnum.FMC },
      });

      expect(result.current).toBe(mockPalette.operational_readiness_status.fmc);

      rerender({ key: OperationalReadinessStatusEnum.DADE });
      expect(result.current).toBe(mockPalette.operational_readiness_status.dade);
    });

    it('responds to theme.palette.text.secondary changes', () => {
      const customTheme = createTheme({
        ...mockTheme,
        palette: {
          ...mockTheme.palette,
          text: {
            ...mockTheme.palette.text,
            secondary: '#CUSTOM_TEXT_SECONDARY',
          },
        },
      });

      const { result } = renderHook(() => useOrStatusColor('UNKNOWN_STATUS'), {
        wrapper: createWrapper(customTheme),
      });

      expect(result.current).toBe('#CUSTOM_TEXT_SECONDARY');
    });
  });
});
