import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { AMTPFilterProvider } from '@context/AMTPFilterProvider';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';

import FilterMenu from '@features/amtp-packet/components/tables/FilterMenu';
import { eventsApiSlice, mosCodeApiSlice } from '@store/amap_ai';
import { faultsApiSlice } from '@store/amap_ai/faults/slices/faultsApi';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { supportingDocumentApiSlice } from '@store/amap_ai/supporting_documents';
import { tasksApiSlice, useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice, useLazyGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Configure store
const store = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    [supportingDocumentApiSlice.reducerPath]: supportingDocumentApiSlice.reducer,
    [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(readinessApiSlice.middleware)
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(unitsApiSlice.middleware)
      .concat(supportingDocumentApiSlice.middleware)
      .concat(faultsApiSlice.middleware)
      .concat(mosCodeApiSlice.middleware),
});

// Provider wrapper for hooks
const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>
    <AMTPFilterProvider>{props.children}</AMTPFilterProvider>
  </ProviderWrapper>
);

describe('FilterMenu Component', () => {
  const mockFilterSwitch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
  });

  it('renders filter button', () => {
    render(<FilterMenu filterType="ctl" setFilterSwitch={mockFilterSwitch} />, { wrapper });
    expect(screen.getByLabelText('filter-btn')).toBeInTheDocument();
  });

  it('opens and closes the filter popper on button click', async () => {
    render(<FilterMenu filterType="ctl" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));
    await waitFor(() => expect(screen.getByText('Filters')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('filter-btn'));
    await waitFor(() => expect(screen.queryByText('Filters')).toBeNull());
  });

  it('clears filters when "Clear Filters" link is clicked', async () => {
    render(<FilterMenu filterType="ctl" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));
    fireEvent.click(screen.getByText('Clear Filters'));

    await waitFor(() => expect(screen.getByText('Filters')).toBeInTheDocument());
    await waitFor(() => expect(mockFilterSwitch).toBeCalledTimes(0));
  });

  // it('fetches MOS data successfully', async () => {
  //   const { result } = renderHook(() => useLazyGetAllMOSQuery(), { wrapper });

  //   const [triggerFetchMOS] = result.current;
  //   const response = await triggerFetchMOS();

  //   expect(response.data).toBeDefined();
  // });

  it('fetches unit data successfully', async () => {
    const { result } = renderHook(() => useLazyGetUnitsQuery(), { wrapper });

    const [triggerFetchUnits] = result.current;
    const response = await triggerFetchUnits({});

    expect(response.data).toBeDefined();
  });

  it('fetches user tasks successfully', async () => {
    const { result } = renderHook(() => useLazyGetUserTasksQuery(), { wrapper });

    const [triggerFetchUserTasks] = result.current;
    const response = await triggerFetchUserTasks({ user_id: '123' });

    expect(response.data).toBeUndefined();
  });

  it('disables "Apply" button when no filters are set', () => {
    render(<FilterMenu filterType="ctl" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));
    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('applies filters when "Apply" button is clicked', async () => {
    render(<FilterMenu filterType="ctl" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));
    fireEvent.click(screen.getByLabelText('apply-filters'));

    await waitFor(() => expect(screen.getByText('Filters')).toBeInTheDocument());
    await waitFor(() => expect(mockFilterSwitch).toBeCalledTimes(0));
  });

  it('renders supporting documents filter menu', async () => {
    render(<FilterMenu filterType="supporting_documents" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));

    const supportingDocumentsFilterMenu = screen.getByLabelText('Supporting Documents Filter Menu');

    expect(supportingDocumentsFilterMenu).toBeInTheDocument();
  });

  it('renders counselings filter menu', async () => {
    render(<FilterMenu filterType="counselings" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));

    const supportingDocumentsFilterMenu = screen.getByLabelText('Counselings Filter Menu');

    expect(supportingDocumentsFilterMenu).toBeInTheDocument();
  });

  it('renders soldier flag filter menu', async () => {
    render(<FilterMenu filterType="soldier_flags" setFilterSwitch={mockFilterSwitch} />, { wrapper });

    fireEvent.click(screen.getByLabelText('filter-btn'));

    const supportingDocumentsFilterMenu = screen.getByLabelText('Soldier Flags Filter Menu');

    expect(supportingDocumentsFilterMenu).toBeInTheDocument();
  });
});
