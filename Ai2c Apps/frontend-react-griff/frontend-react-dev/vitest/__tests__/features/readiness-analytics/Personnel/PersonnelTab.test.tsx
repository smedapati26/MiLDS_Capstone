import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen } from '@testing-library/react';

import PersonnelTab from '@features/readiness-analytics/Personnel/PersonnelTab';

import { store } from '@store/store';

vi.mock('@features/readiness-analytics/Personnel/StatCards/MaintainerStrengthStat', () => ({
  __esModule: true,
  default: () => <div>MaintainerStrengthStat</div>,
}));

vi.mock('@features/readiness-analytics/Personnel/StatCards/AirframeCrewStat', () => ({
  __esModule: true,
  default: () => <div>AirframeCrewStat</div>,
}));

vi.mock('@features/readiness-analytics/Personnel/Accordions/MaintainerExperience', () => ({
  __esModule: true,
  default: () => <div>Maintainer Experience</div>,
}));

vi.mock('@features/readiness-analytics/Personnel/Accordions/MaintainerStrength', () => ({
  __esModule: true,
  default: () => <div>Maintainer Strength</div>,
}));

vi.mock('@features/readiness-analytics/Personnel/Accordions/CrewExperience', () => ({
  __esModule: true,
  default: () => <div>Crew Experience</div>,
}));

vi.mock('@features/readiness-analytics/Personnel/Accordions/CrewStrength', () => ({
  __esModule: true,
  default: () => <div>Crew Strength</div>,
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn((selector) =>
    selector({
      appSettings: {
        currentUic: 'WCEZFF',
      },
    }),
  ),
}));

describe('PersonnelTab Component', () => {
  it('renders the component with correct text', () => {
    render(
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PersonnelTab />
        </LocalizationProvider>
      </Provider>,
    );
    expect(screen.getByText("Viewing today's personnel analytics for WCEZFF.")).toBeInTheDocument();
  });

  it('renders the DatePicker', () => {
    render(
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PersonnelTab />
        </LocalizationProvider>
      </Provider>,
    );
    expect(screen.getByLabelText('Current Date')).toBeInTheDocument();
  });

  it('renders mocked child components', () => {
    render(
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PersonnelTab />
        </LocalizationProvider>
      </Provider>,
    );
    expect(screen.getByText('MaintainerStrengthStat')).toBeInTheDocument();
    expect(screen.getAllByText('AirframeCrewStat').length).toBeGreaterThan(0);
    expect(screen.getByText('Maintainer Experience')).toBeInTheDocument();
    expect(screen.getByText('Maintainer Strength')).toBeInTheDocument();
    expect(screen.getByText('Crew Experience')).toBeInTheDocument();
    expect(screen.getByText('Crew Strength')).toBeInTheDocument();
  });
});
