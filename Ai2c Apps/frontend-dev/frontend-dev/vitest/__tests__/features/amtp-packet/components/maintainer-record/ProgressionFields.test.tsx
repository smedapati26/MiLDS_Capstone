/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactNode } from 'react';
import { Control, FieldErrors, useForm } from 'react-hook-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { ThemeProvider } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { IEventFormValues, IMultiEventForm } from '@features/amtp-packet/components/maintainer-record/AddEditEventForm';
import { IMassEventFormValues } from '@features/amtp-packet/components/maintainer-record/MassEventDialog';
import ProgressionFields from '@features/amtp-packet/components/maintainer-record/ProgressionFields';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';

type ProgressionControlType = IMultiEventForm | IEventFormValues | IMassEventFormValues;

// Configure mock Redux store
const mockStore = configureStore({
  reducer: {},
});

// Helper function to render with providers
const renderWithProviders = (ui: ReactNode) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={{}}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

// Mock API slice hooks
vi.mock('@store/amap_ai/mos_code', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [{ mos: 'MOS1' }, { mos: 'MOS2' }],
    isLoading: false,
  });
});

// React Hook Form Wrapper Component
const TestFormWrapper = ({ children }: { children: (control: Control<IMassEventFormValues>) => ReactNode }) => {
  const { control } = useForm<IMassEventFormValues>();

  return children(control);
};

// Mock Props
const mockProps = {
  formType: 'Training',
  errors: {} as FieldErrors<IMassEventFormValues>,
  isDisabled: false,
};

describe('ProgressionFields Component', () => {
  it('renders the Progression Event label when formType is Training', () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control) => (
          <ThemedTestingComponent>
            <ProgressionFields {...mockProps} control={control as Control<ProgressionControlType, null>} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );

    expect(screen.getByText('Progression Event')).toBeInTheDocument();
  });

  it('renders MOS dropdown with fetched options', async () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control) => (
          <ThemedTestingComponent>
            <ProgressionFields {...mockProps} control={control as Control<ProgressionControlType, null>} />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );
    const combobox = screen.getByRole('combobox', { name: 'MOS' });
    fireEvent.mouseDown(combobox);
    expect(screen.getByText('MOS1')).toBeInTheDocument();
    expect(screen.getByText('MOS2')).toBeInTheDocument();
  });

  it('renders ML dropdown with correct options', () => {
    renderWithProviders(
      <TestFormWrapper>
        {(control) => (
          <ThemedTestingComponent>
            <ProgressionFields
              {...mockProps}
              control={control as Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>}
            />
          </ThemedTestingComponent>
        )}
      </TestFormWrapper>,
    );
    const combobox = screen.getByRole('combobox', { name: 'ML' });
    fireEvent.mouseDown(combobox);
    expect(screen.getByText('ML0')).toBeInTheDocument();
    expect(screen.getByText('ML1')).toBeInTheDocument();
  });
});
