import { describe, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import {
  PhaseFlowProvider,
  usePhaseFlowContext,
} from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

describe('usePhaseFlowContext', () => {
  vi.mock('@mui/material/styles', async (importActual) => {
    const actual = await importActual<typeof import('@mui/material/styles')>();
    return {
      ...actual,
      useTheme: () => ({
        palette: {
          graph: {
            purple: 'test0',
            cyan: 'test1',
            teal: 'test2',
            pink: 'test3',
            green: 'test4',
            blue: 'test5',
            magenta: 'test6',
            yellow: 'test7',
            teal2: 'test8',
            cyan2: 'test9',
            orange: 'test10',
            purple2: 'test11',
          },
        },
      }),
    };
  });
  it('provides and updates context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <PhaseFlowProvider>{children}</PhaseFlowProvider>;
    const { result } = renderHook(() => usePhaseFlowContext(), { wrapper });

    expect(result.current.selectedFamily).toStrictEqual([]);
    expect(result.current.selectedModels).toStrictEqual([]);
    expect(result.current.companyOption).toStrictEqual(undefined);

    act(() => {
      result.current.setSelectedFamily(['BLACK HAWK']);
      result.current.setSelectedModels(['Model 1']);
      result.current.initializeCompany(['test 1', 'test 2']);
    });

    expect(result.current.selectedFamily).toStrictEqual(['BLACK HAWK']);
    expect(result.current.selectedModels).toStrictEqual(['Model 1']);
    expect(result.current.companyOption?.length).toBe(2);
    expect(result.current.companyOption && result.current.companyOption[0].selected).toBe(true);
    expect(result.current.companyOption && result.current.companyOption[1].selected).toBe(true);

    act(() => {
      result.current.toggleCompanyOption('test 1');
    });
    expect(result.current.companyOption && result.current.companyOption[0].selected).toBe(false);
    expect(result.current.companyOption && result.current.companyOption[1].selected).toBe(true);
  });

  it('throws an error if used outside of PhaseFlowProvider', () => {
    expect(() => {
      renderHook(() => usePhaseFlowContext());
    }).toThrow('usePhaseFlow context must be within PhaseFlowProvider.');
  });
});
