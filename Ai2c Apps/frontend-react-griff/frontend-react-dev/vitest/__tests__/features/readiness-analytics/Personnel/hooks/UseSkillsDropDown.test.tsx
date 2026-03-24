import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';

import { CrewExperienceContext } from '@features/readiness-analytics/Personnel/Accordions/CrewExperience/CrewExperienceContext';
import useSkillsDropDown from '@features/readiness-analytics/Personnel/hooks/UseSkillsDropDown';

import { useGetCrewExperienceSkillQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks');
vi.mock('@store/griffin_api/personnel/slices/personnelApi', () => ({
  useGetCrewExperienceSkillQuery: vi.fn(),
}));

const mockUseAppSelector = vi.mocked(useAppSelector);
const mockUseGetCrewExperienceSkillQuery = vi.mocked(useGetCrewExperienceSkillQuery);

const mockContextValue = {
  readinessLevelModels: undefined,
  skillModels: undefined,
  skills: undefined,
  setReadinessLevelModels: vi.fn(),
  setSkillModels: vi.fn(),
  setSkills: vi.fn(),
};

const mockStore = configureStore({
  reducer: {
    appSettings: () => ({
      currentUic: 'TEST123',
    }),
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>
    <CrewExperienceContext.Provider value={mockContextValue}>{children}</CrewExperienceContext.Provider>
  </Provider>
);

describe('useSkillsDropDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue('TEST123');
    mockUseGetCrewExperienceSkillQuery.mockReturnValue({
      data: [
        {
          model: 'CH-47F',
          actual_skills: [{ skill: 'Pilot', count: 5 }],
          authorized_skills: [{ skill: 'Pilot', count: 6 }],
        },
        {
          model: 'UH-60',
          actual_skills: [{ skill: 'Co-Pilot', count: 3 }],
          authorized_skills: [{ skill: 'Co-Pilot', count: 4 }],
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    expect(result.current.modelOptions).toEqual({
      'CH-47F': { label: 'CH-47F', value: 'CH-47F' },
      'UH-60': { label: 'UH-60', value: 'UH-60' },
    });
    expect(result.current.skillOptions).toEqual({
      Pilot: { label: 'Pilot', value: 'Pilot' },
      'Co-Pilot': { label: 'Co-Pilot', value: 'Co-Pilot' },
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.selectedSkillValue).toEqual(['Pilot', 'Co-Pilot']);
    expect(result.current.selectedModelValue).toEqual(['CH-47F', 'UH-60']);
  });

  it('should handle model selection change', () => {
    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    act(() => {
      result.current.handleModelSelectionChange(['CH-47F']);
    });

    expect(mockContextValue.setSkillModels).toHaveBeenCalledWith(['CH-47F']);
    expect(result.current.selectedModelValue).toEqual(['CH-47F']);
  });

  it('should filter skills based on selected models', () => {
    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    act(() => {
      result.current.handleModelSelectionChange(['CH-47F']);
    });

    expect(result.current.skillOptions).toEqual({
      Pilot: { label: 'Pilot', value: 'Pilot' },
    });
    expect(result.current.selectedSkillValue).toEqual(['Pilot']);
  });

  it('should handle skill selection change', () => {
    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    act(() => {
      result.current.handleSkillSelectionChange(['Pilot']);
    });

    expect(mockContextValue.setSkills).toHaveBeenCalledWith(['Pilot']);
    expect(result.current.selectedSkillValue).toEqual(['Pilot']);
  });

  it('should filter data based on selected skills', () => {
    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    act(() => {
      result.current.handleSkillSelectionChange(['Pilot']);
    });

    expect(result.current.filteredSkillsData).toEqual([
      {
        model: 'CH-47F',
        actual_skills: [{ skill: 'Pilot', count: 5 }],
        authorized_skills: [{ skill: 'Pilot', count: 6 }],
      },
    ]);
  });

  it('should return empty arrays when no data', () => {
    mockUseGetCrewExperienceSkillQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    expect(result.current.modelOptions).toEqual({});
    expect(result.current.skillOptions).toEqual({});
    expect(result.current.filteredSkillsData).toEqual([]);
  });

  it('should handle loading state', () => {
    mockUseGetCrewExperienceSkillQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSkillsDropDown(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
