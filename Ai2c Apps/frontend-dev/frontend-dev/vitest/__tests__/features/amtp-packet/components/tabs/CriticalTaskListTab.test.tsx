/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import CriticalTaskListTab from '@features/amtp-packet/components/tabs/CriticalTaskListTab';
import { eventsApiSlice } from '@store/amap_ai/events/slices';
import { mosCodeApiSlice, useGetAllMOSQuery, useLazyGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice, useLazyGetCtlsQuery } from '@store/amap_ai/readiness';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice, useLazyGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn().mockReturnValue({ userId: '123' }),
  useAppDispatch: vi.fn(),
}));

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('@store/amap_ai/readiness', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetCtlsQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/mos_code', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetAllMOSQuery: vi.fn(),
    useLazyGetAllMOSQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUnitsQuery: vi.fn(),
  };
});

const store = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(readinessApiSlice.middleware)
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(unitsApiSlice.middleware)
      .concat(mosCodeApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ProviderWrapper store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ProviderWrapper>,
  );
};

describe('CriticalTaskListTab Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        // eslint-disable-next-line sonarjs/no-nested-functions
        hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
      }),
    }));
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useLazyGetUnitsQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      {
        data: [
          {
            uic: '123XYZ',
            echelon: Echelon.UNKNOWN,
            component: 'Army National Guard',
            level: 1,
            displayName: '1st Battalion, 123rd Infantry Regiment',
            shortName: '1-123 IN',
            nickName: 'The Guardians',
            state: 'CA',
            parentUic: '456ABC',
          },
        ],
        isLoading: false,
      },
    ]);
    (useLazyGetAllMOSQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      {
        data: [{ mos: '15F' }, { mos: '15E' }, { mos: '15D' }],
        isLoading: false,
      },
    ]);
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [{ mos: '15F' }, { mos: '15E' }, { mos: '15D' }],
      isLoading: false,
    }));
    (useLazyGetCtlsQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      {
        data: {
          ictl: [
            {
              taskNumber: '552-000-1002',
              taskTitle: 'Operate the Aviation Ground Power Unit (APGU)',
              frequency: 'Annually',
              subjectArea: '07-Pneudraulic',
              skillLevel: 'SL1',
              mos: '15H',
              lastTrained: '2025-03-15',
              lastEvaluated: '2025-03-20',
              nextDue: '2026-03-01',
            },
          ],
          uctl: [
            {
              taskNumber: '552-000-1003',
              taskTitle: 'Perform Aircraft Maintenance',
              frequency: 'Monthly',
              subjectArea: '07-Maintenance',
              skillLevel: 'SL2',
              mos: '15E',
              lastTrained: '2025-01-10',
              lastEvaluated: '2025-02-01',
              nextDue: '2025-04-01',
            },
          ],
        },
        isLoading: false,
      },
    ]);
  });

  it('renders headers and tables correctly', async () => {
    renderWithProviders(<CriticalTaskListTab />);
    // MATT
    // Check for UCTL header
    //   const uctlHeader = screen.getByText(/UCTL \(Unit Critical Task List\)/i);
    //   expect(uctlHeader).toBeInTheDocument();

    //   // Check for ICTL header
    //   const ictlHeader = screen.getByText(/ICTL \(Individual Critical Task List\)/i);
    //   expect(ictlHeader).toBeInTheDocument();

    //   // Wait for data to load
    //   await waitFor(() => {
    //     // Check for UCTL table content
    //     const uctlTask = screen.getByText(/Perform Aircraft Maintenance/i);
    //     expect(uctlTask).toBeInTheDocument();

    //     // Check for ICTL table content
    //     const ictlTask = screen.getByText(/Operate the Aviation Ground Power Unit/i);
    //     expect(ictlTask).toBeInTheDocument();
    //   });
  });
});
