import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockTestUnit } from 'vitest/mocks/handlers/units/mock_data';

import { screen } from '@testing-library/react';

import { UnitTrackerReportConfigurations } from '@features/unit-health/components/reports/unit-tracker/UnitTrackerReportConfiguration';
import { mapToIUnitBrief } from '@store/amap_ai/units/models';

describe('ReportsTab Tests', () => {
  it('renders correctly and defaults to nothing', async () => {
    renderWithProviders(
      <UnitTrackerReportConfigurations
        reportUnit={mapToIUnitBrief(mockTestUnit)}
        setFilterValue={() => {}}
        setReportColumns={() => {}}
        setReportData={() => {}}
        setReportTitle={() => {}}
        setReportUnit={() => {}}
        units={[mapToIUnitBrief(mockTestUnit)]}
        setReportEvents={() => {}}
      />,
    );

    const unitLabel = screen.getByText('Unit*');
    const birthMonthSelect = screen.getByRole('combobox', { name: 'Birth Month*' });
    const day30Button = screen.getByRole('button', { name: '30-days' });
    const day90Button = screen.getByRole('button', { name: '90-days' });
    const day180Button = screen.getByRole('button', { name: '180-days' });
    const day365Button = screen.getByRole('button', { name: '365-days' });
    const dayAllButton = screen.getByRole('button', { name: 'all-days' });
    const customDateCheckbox = screen.getByRole('checkbox');
    const eventsButton = screen.getByRole('button', { name: 'Events Filter Button' });
    const taskNumberButton = screen.getByRole('button', { name: 'Task Numbers Filter Button' });

    const generateButton = screen.getByRole('button', { name: 'Generate' });

    expect(unitLabel).toBeInTheDocument();
    expect(birthMonthSelect).toBeInTheDocument();
    expect(day30Button).toBeInTheDocument();
    expect(day90Button).toBeInTheDocument();
    expect(day180Button).toBeInTheDocument();
    expect(day365Button).toBeInTheDocument();
    expect(dayAllButton).toBeInTheDocument();
    expect(customDateCheckbox).toBeInTheDocument();
    expect(eventsButton).toBeInTheDocument();
    expect(taskNumberButton).toBeInTheDocument();

    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });
});
