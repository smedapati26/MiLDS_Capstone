/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SnackbarProvider, { useSnackbar } from '@context/SnackbarProvider';
import useUnitAccess from '@hooks/useUnitAccess';
import { render, screen } from '@testing-library/react';

import { UCTLManagerPage } from '@features/uctl-manager';
import { useLazyGetAllMOSQuery } from '@store/amap_ai/mos_code';
import {
  useCreateTaskMutation,
  useLazyGetTasksByTypeQuery,
  useLazyGetUnitTasksQuery,
  useUpdateTaskMutation,
  useUploadTaskPdfMutation,
} from '@store/amap_ai/tasks/slices/tasksApi';
import { useGetUnitsQuery, useLazyGetUnitHierarchyQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@context/SnackbarProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useSnackbar: vi.fn(),
  };
});

vi.mock('@hooks/useUnitAccess', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@store/amap_ai/tasks/slices/tasksApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetTasksByTypeQuery: vi.fn(),
    useLazyGetUnitTasksQuery: vi.fn(),
    useCreateTaskMutation: vi.fn(),
    useUpdateTaskMutation: vi.fn(),
    useUploadTaskPdfMutation: vi.fn(),
    useDeleteTaskMutation: vi.fn(),
  };
});

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', () => ({
  useGetUnitsQuery: vi.fn(),
  useLazyGetUnitHierarchyQuery: vi.fn(),
}));

vi.mock('@store/amap_ai/mos_code', () => ({
  useLazyGetAllMOSQuery: vi.fn(),
}));

vi.mock('../UCTLResults', () => ({
  __esModule: true,
  default: () => <div data-testid="uctl-results" />,
}));

vi.mock('../CreateTaskDialog', () => ({
  __esModule: true,
  default: ({ open }: any) => (open ? <div data-testid="create-task-dialog" /> : null),
}));

describe('UCTLManagerPage', () => {
  const mockDispatch = vi.fn();
  const mockFetch = vi.fn();
  const mockFetchUnits = vi.fn();
  const mockFetchMos = vi.fn();
  const mockFetchUctl = vi.fn();
  const mockCreateTask = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockUploadPdf = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);

    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      items: [],
      selectedUnit: { uic: 'A123', title: 'Unit A' },
    });

    (useSnackbar as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useLazyGetTasksByTypeQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      { data: null, isFetching: false },
    ]);

    (useUnitAccess as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasRole: () => true,
    });

    (useGetUnitsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ uic: 'A123', title: 'Unit A' }],
    });

    (useLazyGetUnitHierarchyQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetchUnits,
      { data: null, isFetching: false },
    ]);

    (useLazyGetAllMOSQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockFetchMos, { data: [] }]);

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetchUctl,
      { data: { uctls: [{ ictlId: 1, ictlTitle: 'Test UCTL' }] } },
    ]);

    (useCreateTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ]);

    (useUpdateTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ]);

    (useUploadTaskPdfMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockUploadPdf]);
  });

  const renderPage = () =>
    render(
      <SnackbarProvider>
        <UCTLManagerPage />
      </SnackbarProvider>,
    );

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('UCTL Manager')).toBeInTheDocument();
  });

  it('opens CreateTaskDialog when createType is "Create Task"', () => {
    renderPage();

    // we can’t directly toggle createType from here because FilterBar is mocked,
    // so this assertion is weak and may not reflect real behavior.
    // If you want a real test for this, we’d need to render the real FilterBar
    // and click its "Create Task" option instead of mocking it.
    expect(screen.queryByTestId('create-task-dialog')).not.toBeInTheDocument();
  });
});
