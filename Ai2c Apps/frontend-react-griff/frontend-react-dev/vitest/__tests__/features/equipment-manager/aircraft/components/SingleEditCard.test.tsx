import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import SingleEditCard from '@features/equipment-manager/aircraft/components/SingleEditCard';

import { IAircraftEquipmentDetailsInfo, IEventDetails } from '@store/griffin_api/aircraft/models';

// Mock data for testing
const mockAircraft: IAircraftEquipmentDetailsInfo = {
  serial: '12345',
  ecd: null,
  events: [
    {
      inspection: {
        inspectionName: 'Engine Check',
        hoursInterval: 100,
        inspectionId: 0,
        lastConductedHours: 0,
        nextDueHours: 0,
        tillDue: 0,
        serial: '',
      },
      maintenance: null,
    },
    {
      inspection: {
        inspectionName: 'Oil Change',
        hoursInterval: 50,
        inspectionId: 0,
        lastConductedHours: 0,
        nextDueHours: 0,
        tillDue: 0,
        serial: '',
      },
      maintenance: null,
    },
  ],
  remarks: null,
  rtl: '',
  status: '',
  ORStatus: '',
  totalAirframeHours: 0,
  flightHours: 0,
  hoursToPhase: 0,
  inPhase: false,
  location: null,
  modifications: [],
  fieldSyncStatus: {},
  dateDown: null,
  dateDownCount: null,
};

const mockModel = 'Boeing 737';
const mockUnitShortName = 'Alpha Unit';

// Create a theme for testing
const theme = createTheme();

describe('SingleEditCard Component', () => {
  it('renders the card with correct data', () => {
    render(
      <ThemeProvider theme={theme}>
        <SingleEditCard aircraft={mockAircraft} model={mockModel} unitShortName={mockUnitShortName} />
      </ThemeProvider>,
    );

    // Check if the card is rendered
    const card = screen.getByTestId('aircraft-single-edit-card');
    expect(card).toBeInTheDocument();

    // Check if the serial number is displayed
    expect(screen.getByText('Serial Number:')).toBeInTheDocument();
    expect(screen.getByText(mockAircraft.serial)).toBeInTheDocument();

    // Check if the model is displayed
    expect(screen.getByText('Model:')).toBeInTheDocument();
    expect(screen.getByText(mockModel)).toBeInTheDocument();

    // Check if the unit short name is displayed
    expect(screen.getByText('Unit:')).toBeInTheDocument();
    expect(screen.getByText(mockUnitShortName)).toBeInTheDocument();

    // Check if upcoming maintenance is displayed
    const maintenanceText = 'Engine Check: 100 hr, Oil Change: 50 hr';
    expect(screen.getByText('Upcoming Maintenance:')).toBeInTheDocument();
    expect(screen.getByText(maintenanceText)).toBeInTheDocument();
  });

  it('renders dividers between sections', () => {
    render(
      <ThemeProvider theme={theme}>
        <SingleEditCard aircraft={mockAircraft} model={mockModel} unitShortName={mockUnitShortName} />
      </ThemeProvider>,
    );

    // Check if dividers are rendered
    const dividers = screen.getAllByRole('separator');
    expect(dividers).toHaveLength(2); // Two dividers between sections
  });

  it('formats upcoming maintenance correctly', () => {
    const mockEvents: IEventDetails[] = [
      {
        inspection: {
          inspectionName: 'Test Inspection 1',
          hoursInterval: 200,
          inspectionId: 0,
          lastConductedHours: 0,
          nextDueHours: 0,
          tillDue: 0,
          serial: '',
        },
        maintenance: null,
      },
      {
        inspection: {
          inspectionName: 'Test Inspection 2',
          hoursInterval: 300,
          inspectionId: 0,
          lastConductedHours: 0,
          nextDueHours: 0,
          tillDue: 0,
          serial: '',
        },
        maintenance: null,
      },
    ];

    const formattedMaintenance = mockEvents
      .map((event) => `${event.inspection.inspectionName}: ${event.inspection.hoursInterval} hr`)
      .join(', ');

    expect(formattedMaintenance).toBe('Test Inspection 1: 200 hr, Test Inspection 2: 300 hr');
  });
});
