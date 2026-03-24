import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { renderHook } from '@testing-library/react';

import useDataDisplayTagColor from '@hooks/useDataDisplayTagColor';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

import '@testing-library/jest-dom';

// Light mode palette based on mockPalette
const lightMockPalette = {
  ...mockPalette,
  mode: 'light' as const,
  text: {
    primary: '#1A1A1A',
    secondary: '#1A1A1AB3', // 70% opacity
    disabled: '#1A1A1A66', // 40% opacity
    contrastText: '#FFFFFF',
  },
};

const createWrapper = (theme: ReturnType<typeof createTheme>) => {
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  WrapperComponent.displayName = 'ThemeWrapper';
  return WrapperComponent;
};

describe('useDataDisplayTagColor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dark Mode', () => {
    const darkTheme = createTheme({ palette: mockPalette });

    it('returns correct TagColor for FMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.success!.d60,
        backgroundColor: mockPalette.success!.l80,
      });
    });

    it('returns correct TagColor for PMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.PMC), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.warning!.d60,
        backgroundColor: mockPalette.warning!.l60,
      });
    });

    it('returns correct TagColor for PMCS status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.PMCS), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.warning!.d60,
        backgroundColor: mockPalette.warning!.l60,
      });
    });

    it('returns correct TagColor for PMCM status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.PMCM), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.warning!.d60,
        backgroundColor: mockPalette.warning!.l60,
      });
    });

    it('returns correct TagColor for NMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.NMC), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.error!.d60,
        backgroundColor: mockPalette.error!.l80,
      });
    });

    it('returns correct TagColor for NMCM status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.NMCM), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.error!.d60,
        backgroundColor: mockPalette.error!.l80,
      });
    });

    it('returns correct TagColor for NMCS status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.NMCS), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.error!.d60,
        backgroundColor: mockPalette.error!.l80,
      });
    });

    it('returns correct TagColor for SUST status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.SUST), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.error!.d60,
        backgroundColor: mockPalette.error!.l80,
      });
    });

    it('returns correct TagColor for FIELD status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.FIELD), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.error!.d60,
        backgroundColor: mockPalette.error!.l80,
      });
    });

    it('returns correct TagColor for DADE status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.DADE), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.info!.d60,
        backgroundColor: mockPalette.info!.l60,
      });
    });

    it('returns default TagColor for unknown status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor('UNKNOWN'), {
        wrapper: createWrapper(darkTheme),
      });

      expect(result.current).toEqual({
        color: mockPalette.text!.primary,
        backgroundColor: mockPalette.grey!.l40,
      });
    });
  });

  describe('Light Mode', () => {
    const lightTheme = createTheme({ palette: lightMockPalette });

    it('returns correct TagColor for FMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(lightTheme),
      });

      expect(result.current).toEqual({
        color: lightMockPalette.text.contrastText,
        backgroundColor: lightMockPalette.success!.d20,
      });
    });

    it('returns correct TagColor for PMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.PMC), {
        wrapper: createWrapper(lightTheme),
      });

      expect(result.current).toEqual({
        color: lightMockPalette.text.primary,
        backgroundColor: lightMockPalette.warning!.main,
      });
    });

    it('returns correct TagColor for NMC status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.NMC), {
        wrapper: createWrapper(lightTheme),
      });

      expect(result.current).toEqual({
        color: lightMockPalette.text.contrastText,
        backgroundColor: lightMockPalette.error!.d20,
      });
    });

    it('returns correct TagColor for DADE status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.DADE), {
        wrapper: createWrapper(lightTheme),
      });

      expect(result.current).toEqual({
        color: lightMockPalette.text!.contrastText,
        backgroundColor: lightMockPalette.info!.d40,
      });
    });

    it('returns default TagColor for unknown status', () => {
      const { result } = renderHook(() => useDataDisplayTagColor('UNKNOWN'), {
        wrapper: createWrapper(lightTheme),
      });

      expect(result.current).toEqual({
        color: lightMockPalette.text.primary,
        backgroundColor: lightMockPalette.grey!.l40,
      });
    });
  });

  describe('Type Safety', () => {
    it('accepts OperationalReadinessStatusEnum values', () => {
      const { result } = renderHook(() => useDataDisplayTagColor(OperationalReadinessStatusEnum.FMC), {
        wrapper: createWrapper(createTheme({ palette: mockPalette })),
      });

      expect(result.current.color).toBeDefined();
      expect(result.current.backgroundColor).toBeDefined();
    });

    it('accepts string values', () => {
      const { result } = renderHook(() => useDataDisplayTagColor('custom-string'), {
        wrapper: createWrapper(createTheme({ palette: mockPalette })),
      });

      expect(result.current).toEqual({
        color: mockPalette.text!.primary,
        backgroundColor: mockPalette.grey!.l40,
      });
    });
  });
});
