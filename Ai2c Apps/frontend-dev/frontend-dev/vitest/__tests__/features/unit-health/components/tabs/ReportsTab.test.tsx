import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import ReportsTab from '@features/unit-health/components/tabs/ReportsTab';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

describe('ReportsTab Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      reportType: 'mos/ml',
      unitHealthSelectedUnit: { uic: "ABCDEFG", name: 'Unit A' },
    });
  });
  it('renders correctly and defaults to nothing', () => {
    renderWithProviders(<ReportsTab />);

    const divElements = screen.getByLabelText('Reports Tab');
    const reportTypeSelect = screen.getByRole('combobox');
    const noReportText = screen.getByText('Configure your report using the filters above.');

    expect(divElements).toBeInTheDocument();
    expect(reportTypeSelect).toBeInTheDocument();
    expect(noReportText).toBeInTheDocument();
  });

  it('renders correctly for unit mos/ml', async () => {
    renderWithProviders(<ReportsTab />);

    const divElements = screen.getByLabelText('Reports Tab');
    const reportTypeSelect = screen.getByRole('combobox');
    const noReportText = screen.getByText('Configure your report using the filters above.');

    expect(divElements).toBeInTheDocument();
    expect(reportTypeSelect).toBeInTheDocument();
    expect(noReportText).toBeInTheDocument();

    fireEvent.mouseDown(reportTypeSelect);

    const mosMLOption = screen.getByRole('option', { name: 'Unit MOS/ML Breakdown' });

    expect(mosMLOption).toBeInTheDocument();

    fireEvent.click(mosMLOption);

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

    // await waitFor(() => {
    //   primaryUnitReport = screen.getByLabelText('Primary Unit Report Table');

    //   expect(primaryUnitReport).toBeInTheDocument();
    // })
  });
});
