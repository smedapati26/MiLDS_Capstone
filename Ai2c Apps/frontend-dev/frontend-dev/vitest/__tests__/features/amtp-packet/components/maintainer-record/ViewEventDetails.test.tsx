import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import ViewEventDetails from '@features/amtp-packet/components/maintainer-record/ViewEventDetails';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { IDa7817s } from '@store/amap_ai/events';

const mockStore = configureStore({
  reducer: {
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

describe('ViewEventDetails Component', () => {
  const mockEvent: IDa7817s = {
    id: 1,
    soldierId: '123456789',
    date: '',
    uicId: 'ABC123',
    eventType: 'Evaluation',
    trainingType: 'TCS',
    evaluationType: 'Annual',
    goNogo: 'GO',
    gainingUnitId: null,
    gainingUnit: null,
    tcsLocation: 'XYZ',
    awardType: 'Achievement Award',
    totalMxHours: 5,
    comment: 'This is a test comment.',
    maintenanceLevel: 'ML1',
    recordedByLegacy: null,
    recordedById: 'user123',
    recordedByNonLegacy: null,
    attachedDa4856Id: null,
    eventDeleted: false,
    mos: 'MOS001',
    eventTasks: [
      { number: '001', name: 'Engine Maintenance', goNogo: 'GO' },
      { number: '002', name: 'Flight Inspection', goNogo: 'NO-GO' },
    ],
    hasAssociations: true,
  };

  it('renders event details correctly', () => {
    renderWithProviders(<ViewEventDetails event={mockEvent} />);

    // Assert static text is rendered
    expect(screen.getByText(/only the creator of this event can edit/i)).toBeInTheDocument();

    // Assert event details are rendered
    expect(screen.getByText('Evaluation')).toBeInTheDocument();
    expect(screen.queryByText('TCS')).not.toBeInTheDocument();
    expect(screen.getByText('This is a test comment.')).toBeInTheDocument();
    expect(screen.getByText('Total MX Hours:')).toBeInTheDocument();
    expect(screen.getByText('Event Result:')).toBeInTheDocument();
    expect(screen.getByText('Progression Event:')).toBeInTheDocument();
  });

  it('renders tasks correctly when provided', () => {
    renderWithProviders(<ViewEventDetails event={mockEvent} />);

    // Assert task names are displayed as list items
    expect(screen.getByText('Engine Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Flight Inspection')).toBeInTheDocument();
  });

  it('does not render tasks section when no tasks are provided', () => {
    const eventWithoutTasks = { ...mockEvent, eventTasks: [] }; // Fixed the key name
    renderWithProviders(<ViewEventDetails event={eventWithoutTasks} />);

    // Assert tasks section is not rendered
    expect(screen.queryByText(/associated tasks to training/i)).not.toBeInTheDocument();
  });
});
