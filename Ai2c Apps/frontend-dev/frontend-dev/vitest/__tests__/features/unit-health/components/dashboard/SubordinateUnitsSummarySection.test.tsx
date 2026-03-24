import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitHealthData } from 'vitest/mocks/handlers/unit-health/unit-health-summary-data/mock_data';

import { screen } from '@testing-library/react';

import SubordinateUnitsSummarySection from '@features/unit-health/components/dashboard/SubordinateUnitsSummarySection';
import { mapToIUnitHealthData } from '@store/amap_ai/unit_health';

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
  it('renders correctly with unloaded/null data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <SubordinateUnitsSummarySection loading={false} selectedUnit={undefined} unitHealthData={null} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Subordinate Units Summary Section');
    const subordinateUnitSummaryAvailabilityBreakdown = screen.getByLabelText(
      'Subordinate Unit Summary Availability Breakdown',
    );
    const subordinateUnitSummaryMOSBreakdown = screen.getByLabelText('Subordinate Unit Summary MOS Breakdown');

    expect(divElements).toBeInTheDocument();
    expect(subordinateUnitSummaryAvailabilityBreakdown).toBeInTheDocument();
    expect(subordinateUnitSummaryMOSBreakdown).toBeInTheDocument();
  });

  it('renders correctly with data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <SubordinateUnitsSummarySection
          loading={false}
          selectedUnit={undefined}
          unitHealthData={mapToIUnitHealthData(mockUnitHealthData)}
        />
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Subordinate Units Summary Section');
    const subordinateUnitSummaryAvailabilityBreakdown = screen.getByLabelText(
      'Subordinate Unit Summary Availability Breakdown',
    );
    const subordinateUnitSummaryMOSBreakdown = screen.getByLabelText('Subordinate Unit Summary MOS Breakdown');
    const subordinateUnitSummaryMOSBreakdownFooter = screen.getByLabelText(
      'Subordiante Unit Summary MOS Breakdown Footer',
    );

    expect(divElements).toBeInTheDocument();
    expect(subordinateUnitSummaryAvailabilityBreakdown).toBeInTheDocument();
    expect(subordinateUnitSummaryMOSBreakdown).toBeInTheDocument();
    expect(subordinateUnitSummaryMOSBreakdownFooter).toBeInTheDocument();
  });
});
