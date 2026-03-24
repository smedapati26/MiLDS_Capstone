import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { screen } from '@testing-library/react';

import DashboardTab from '@features/unit-health/components/tabs/DashboardTab';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

describe('Dashboard Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      reportType: 'mos/ml',
      unitHealthSelectedUnit: { uic: 'ABCDEFG', name: 'Unit A' },
    });
  });
  it('renders correctly', () => {
    RenderHelper(
      <ThemedTestingComponent>
        <DashboardTab />
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Dashboard Tab');
    const unitSelect = screen.getByRole('textbox', { name: 'Unit' });
    const asOfDate = screen.getByLabelText('As Of Date');
    const unitTitle = screen.getByLabelText('Unit Traversal');
    const unitSummaryPaper = screen.getByLabelText('Unit Summary Section');
    const unitSummaryAvailabilityPaper = screen.getByLabelText('Unit Availability Bar');
    const unitSummaryEvaluationsPaper = screen.getByLabelText('Unit Evaluations Bar');
    const unitSummaryMissingPacketsPaper = screen.getByLabelText('Unit Missing Packets');
    const unitSummaryMOSBreakdownPaper = screen.getByLabelText('MOS Breakdown');

    expect(divElements).toBeInTheDocument();
    expect(unitSelect).toBeInTheDocument();
    expect(asOfDate).toBeInTheDocument();
    expect(unitTitle).toBeInTheDocument();
    expect(unitSummaryPaper).toBeInTheDocument();
    expect(unitSummaryAvailabilityPaper).toBeInTheDocument();
    expect(unitSummaryEvaluationsPaper).toBeInTheDocument();
    expect(unitSummaryMissingPacketsPaper).toBeInTheDocument();
    expect(unitSummaryMOSBreakdownPaper).toBeInTheDocument();
  });
});
