import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitHealthData } from 'vitest/mocks/handlers/unit-health/unit-health-summary-data/mock_data';

import { fireEvent, screen } from '@testing-library/react';

import UnitSummarySection from '@features/unit-health/components/dashboard/UnitSummarySection';
import { mapToIUnitHealthData } from '@store/amap_ai/unit_health';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Dashboard Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      reportType: 'mos/ml',
      unitHealthSelectedUnit: { uic: 'ABCDEFG', name: 'Unit A' },
      subordinateTableView: false,
    });
  });
  it('renders correctly with unloaded/undefined data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <UnitSummarySection
            selectedUnit={undefined}
            asOfDate={dayjs('05/12/2100')}
            unitHealthData={null}
            loading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Unit Summary Section');
    const unitSummaryAvailabilityPaper = screen.getByLabelText('Unit Availability Bar');
    const unitSummaryEvaluationsPaper = screen.getByLabelText('Unit Evaluations Bar');
    const unitSummaryMissingPacketsPaper = screen.getByLabelText('Unit Missing Packets');
    const unitSummaryMOSBreakdownPaper = screen.getByLabelText('MOS Breakdown');
    const unitAvailabilityDialogButton = screen.getByLabelText('Unit Availability Table View Button');
    const unitAvailabilityDialog = screen.queryByLabelText('Unit Availability Dialog');

    expect(divElements).toBeInTheDocument();
    expect(unitSummaryAvailabilityPaper).toBeInTheDocument();
    expect(unitSummaryEvaluationsPaper).toBeInTheDocument();
    expect(unitSummaryMissingPacketsPaper).toBeInTheDocument();
    expect(unitSummaryMOSBreakdownPaper).toBeInTheDocument();
    expect(unitAvailabilityDialogButton).toBeInTheDocument();
    expect(unitAvailabilityDialog).not.toBeInTheDocument();
  });

  it('renders correctly with data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <UnitSummarySection
            loading={false}
            selectedUnit={undefined}
            asOfDate={dayjs('05/12/2100')}
            unitHealthData={mapToIUnitHealthData(mockUnitHealthData)}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Unit Summary Section');
    const unitSummaryAvailabilityPaper = screen.getByLabelText('Unit Availability Bar');
    const unitSummaryEvaluationsPaper = screen.getByLabelText('Unit Evaluations Bar');
    const unitSummaryMissingPacketsPaper = screen.getByLabelText('Unit Missing Packets');
    const unitSummaryMOSBreakdownPaper = screen.getByLabelText('MOS Breakdown');
    const unitAvailabilityDialogButton = screen.getByLabelText('Unit Availability Table View Button');
    let unitAvailabilityDialog = screen.queryByLabelText('Unit Availability Dialog');

    expect(divElements).toBeInTheDocument();
    expect(unitSummaryAvailabilityPaper).toBeInTheDocument();
    expect(unitSummaryEvaluationsPaper).toBeInTheDocument();
    expect(unitSummaryMissingPacketsPaper).toBeInTheDocument();
    expect(unitSummaryMOSBreakdownPaper).toBeInTheDocument();
    expect(unitAvailabilityDialogButton).toBeInTheDocument();
    expect(unitAvailabilityDialog).not.toBeInTheDocument();

    fireEvent.click(unitAvailabilityDialogButton);

    unitAvailabilityDialog = screen.getByLabelText('Unit Availability Dialog');

    expect(unitAvailabilityDialog).toBeInTheDocument();
  });
});
