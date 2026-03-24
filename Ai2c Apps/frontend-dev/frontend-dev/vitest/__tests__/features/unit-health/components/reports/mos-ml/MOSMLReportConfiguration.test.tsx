import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockTestUnit } from 'vitest/mocks/handlers/units/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { MOSMLReportConfigurations } from '@features/unit-health/components/reports/mos-ml/MOSMLReportConfiguration';
import { mapToIUnitBrief } from '@store/amap_ai/units/models';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('ReportsTab Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      reportConfig: [],
    });
  });
  it('renders correctly and defaults to nothing', async () => {
    renderWithProviders(
      <MOSMLReportConfigurations
        reportUnit={mapToIUnitBrief(mockTestUnit)}
        setFilterValue={() => {}}
        setReportColumns={() => {}}
        setReportData={() => {}}
        setReportTitle={() => {}}
        setReportUnit={() => {}}
        units={[mapToIUnitBrief(mockTestUnit)]}
      />,
    );

    const unitLabel = screen.getByText('Unit*');
    const mosButton = screen.getByRole('button', { name: 'MOS View By Button' });
    const mlButton = screen.getByRole('button', { name: 'ML View By Button' });
    const generateButton = screen.getByRole('button', { name: 'Generate' });
    const primaryUnitReport = screen.queryByLabelText('Primary Unit Report Table');

    expect(unitLabel).toBeInTheDocument();
    expect(mosButton).toBeInTheDocument();
    expect(mlButton).toBeInTheDocument();
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
    expect(primaryUnitReport).not.toBeInTheDocument();

    fireEvent.click(mosButton);

    await waitFor(() => {
      expect(generateButton).toBeEnabled();
    });

    fireEvent.click(generateButton);
  });
});
