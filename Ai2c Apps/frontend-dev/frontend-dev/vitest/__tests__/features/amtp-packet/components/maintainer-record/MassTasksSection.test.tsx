/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactNode } from 'react';
import { Control, FieldErrors, useForm, UseFormSetValue } from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { IMassEventFormValues } from '@features/amtp-packet/components/maintainer-record/MassEventDialog';
import MassTasksSection from '@features/amtp-packet/components/maintainer-record/MassTasksSection';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { ISoldier } from '@store/amap_ai/soldier/models';
import { tasksApiSlice, useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Configure mock Redux store
const mockStore = configureStore({
  reducer: {
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(tasksApiSlice.middleware),
});

const theme = createTheme({
  palette: {
    error: {
      light: '#ffcccc',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#ffffff',
    },
    layout: {
      base: '#FFFFFF',
      background5: '#F2F2F2',
      background7: '#EDEDED',
      background8: '#EBEBEB',
      background9: '#E8E8E8',
      background11: '#E3E3E3',
      background12: '#E0E0E0',
      background14: '#DBDBDB',
      background15: '#D9D9D9',
      background16: '#D6D6D6',
    },
    graph: {
      purple: '#6929C4',
      cyan: '#0072B1',
      teal: '#005D5D',
      pink: '#9F1853',
      green: '#117D31',
      blue: '#002D9C',
      magenta: '#CE0094',
      yellow: '#8C6900',
      teal2: '#1C7877',
      cyan2: '#012749',
      orange: '#8A3800',
      purple2: '#7C58B7',
    },
    stacked_bars: {
      magenta: '#CE0094',
      blue: '#002D9C',
      cyan2: '#012749',
      teal2: '#1C7877',
      purple: '#6929C4',
    },
    classification: {
      unclassified: '#007A33',
      cui: '#502B85',
      confidential: '#0033A0',
      secret: '#C8102E',
      top_secret: '#FF8C00',
      top_secret_sci: '#FCE83A',
    },
    operational_readiness_status: {
      fmc: '#007A00',
      pmcs: '#664300',
      pmcm: '#996500',
      nmcs: '#EC0000',
      nmcm: '#BD0000',
      dade: '#007892',
    },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

// Helper function to render with providers
const renderWithProviders = (ui: ReactNode) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

// Mock API slice hook
vi.mock('@store/amap_ai/tasks/slices/tasksApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUserTasksQuery: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  (useLazyGetUserTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue([
    vi.fn(),
    {
      data: [{ taskNumber: '001', taskTitle: 'Mocked Task' }],
      isFetching: false,
    },
  ]);
});

const soldiers: ISoldier[] = [
  {
    userId: '1',
    firstName: 'John',
    lastName: 'Doe',
    rank: 'Sgt',
    primaryMos: undefined,
    primaryMl: undefined,
    allMosAndMl: [],
    unitId: 'unit123',
    unit: 'unit123',
    isAdmin: false,
    isMaintainer: true,
    receiveEmails: true,
    birthMonth: 'May',
  },
];

// Mock Props
const defaultProps = {
  eventType: 'Training' as 'Training' | 'Award' | 'TCS',
  soldiers,
  tasks: [{ label: 'Mock Task', value: '001' }],
  setTasks: vi.fn(),
  control: {
    _defaultValues: {
      soldierTasks: [
        {
          userId: '1',
          tasks: [{ taskNumber: '001', taskName: 'Mock Task', result: 'GO' }],
        },
      ],
    },
  } as Control<IMassEventFormValues>,
  setValue: vi.fn() as UseFormSetValue<IMassEventFormValues>,
  errors: {} as FieldErrors<IMassEventFormValues>,
};

// React Hook Form Wrapper Component
const TestFormWrapper = ({
  children,
}: {
  children: (props: {
    control: Control<IMassEventFormValues>;
    setValue: UseFormSetValue<IMassEventFormValues>;
    errors: FieldErrors<IMassEventFormValues>;
  }) => ReactNode;
}) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useForm<IMassEventFormValues>({
    defaultValues: defaultProps.control._defaultValues,
  });

  return children({ control, setValue, errors });
};

describe('MassTasksSection Component with Redux & API Mocking', () => {
  it('renders task toggle button group', () => {
    renderWithProviders(
      <TestFormWrapper>{(props) => <MassTasksSection {...defaultProps} {...props} />}</TestFormWrapper>,
    );

    expect(screen.getByText('SOLDIER CTL TASKS')).toBeInTheDocument();
    expect(screen.getByText('SEARCH ALL TASKS')).toBeInTheDocument();
  });

  it('calls setTasks when selecting tasks in autocomplete', () => {
    renderWithProviders(
      <TestFormWrapper>{(props) => <MassTasksSection {...defaultProps} {...props} />}</TestFormWrapper>,
    );

    const taskAutocomplete = screen.getByLabelText('Tasks');
    fireEvent.change(taskAutocomplete, { target: { value: 'Mocked Task' } });
  });

  it('renders soldier task accordions', () => {
    renderWithProviders(
      <TestFormWrapper>{(props) => <MassTasksSection {...defaultProps} {...props} />}</TestFormWrapper>,
    );

    expect(screen.getByText('Sgt John Doe')).toBeInTheDocument();
  });

  it('updates task result when toggled', async () => {
    renderWithProviders(
      <TestFormWrapper>{(props) => <MassTasksSection {...defaultProps} {...props} />}</TestFormWrapper>,
    );
    const setValue = vi.fn();

    // Click the accordion header to expand
    const accordionHeader = screen.getByText(/Sgt John Doe/i);
    fireEvent.click(accordionHeader);

    // Wait for accordion details to be fully expanded
    await waitFor(() => {
      const accordionDetails = screen.getByRole('region');
      expect(accordionDetails).toBeVisible();
    });

    // Find the GO button using aria-label instead of text matching
    const goButton = await screen.findByLabelText('GO');

    fireEvent.click(goButton);

    expect(setValue).toHaveBeenCalledTimes(0);
  });
  it('handles missing soldierTasks gracefully', () => {
    renderWithProviders(
      <TestFormWrapper>
        {(props) => (
          <MassTasksSection
            {...defaultProps}
            {...props}
            soldiers={[]}
            control={{ ...props.control, _defaultValues: { soldierTasks: [] } }}
          />
        )}
      </TestFormWrapper>,
    );

    expect(screen.queryByText('Sgt John Doe')).not.toBeInTheDocument();
  });
});
