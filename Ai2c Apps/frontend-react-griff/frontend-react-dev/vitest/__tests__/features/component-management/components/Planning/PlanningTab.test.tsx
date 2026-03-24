import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import PlanningTab from '@features/component-management/components/Planning/PlanningTab';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useExportChecklistMutation, useGetFailureCountQuery } from '@store/griffin_api/components/slices';
import { useAppSelector } from '@store/hooks';
import { store } from '@store/store';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftByUicQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/components/slices', () => ({
  useGetFailureCountQuery: vi.fn(),
  useExportChecklistMutation: vi.fn(() => [
    vi.fn(), // mock mutation function
    { isLoading: false }, // mock state object
  ]),
}));

const sampleAircraftData = [
  { aircraftModel: 'Model A', aircraftFamily: 'Family 1', serial: 'SN123' },
  { aircraftModel: 'Model B', aircraftFamily: 'Family 1', serial: 'SN456' },
  { aircraftModel: 'Model C', aircraftFamily: 'Family 2', serial: 'SN789' },
];

const componentData = [{ nomenclature: 'Gargamouth', wuc: '123456', partNumber: 'AEHCF', failureCount: 3 }];

const renderComponent = () =>
  render(
    <Provider store={store}>
      <PlanningTab />
    </Provider>,
  );

describe('PlanningTab', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('WDYFAA');
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: sampleAircraftData,
      isLoading: false,
    });
    (useGetFailureCountQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: componentData,
      isLoading: false,
      refetch: () => {},
    });
    (useExportChecklistMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn().mockResolvedValue({}),
      { isLoading: false },
    ]);
  });

  it('renders correctly with labels and sliders', () => {
    renderComponent();

    // Check AircraftDropdown label
    expect(screen.getByText('Select aircraft(s):')).toBeInTheDocument();

    // Check PmxSlider labels
    expect(screen.getByText('Select a minimum failure probability:')).toBeInTheDocument();
    expect(
      screen.getByText('Select future flight hours to see predicted component failures and supplies to have on hand:'),
    ).toBeInTheDocument();
  });

  it('handles AircraftDropdown selection', () => {
    renderComponent();
    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
  });

  it('handles AircraftDropdown selection', () => {
    renderComponent();
    const combobox = screen.getAllByRole('combobox')[1];
    fireEvent.mouseDown(combobox);
  });

  it('handles PmxSlider failure value change', async () => {
    renderComponent();

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: '75' } });
    await waitFor(() => expect(inputElement).toHaveValue('75%'));
  });

  it('handles PmxSlider future hours change', async () => {
    renderComponent();

    // Get the future hours slider and change value
    const inputElement = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: '75' } });
    await waitFor(() => expect(inputElement).toHaveValue(75));
  });

  it('handles export checklist mutation', async () => {
    renderComponent();

    // Locate the IconButton using querySelector
    const exportButton = document.querySelector('button[aria-label="export checklist"]');
    if (exportButton) {
      fireEvent.click(exportButton);
    }
  });

  it('handle Parts Failure Learn More', async () => {
    // use act(...) for state changes to get affect testing.

    renderComponent();

    const combobox = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.click(combobox);
    });

    const partsLearnMoreButton = screen.getByTestId('part-failure-predictive-model-learn-more-button');
    expect(partsLearnMoreButton).toBeInTheDocument();

    // modal showing on click
    await act(async () => {
      fireEvent.click(partsLearnMoreButton);
    });

    expect(screen.getByTestId('parts-failure-predictive-model-dialog')).toBeInTheDocument();

    // modal has proper messaging
    const paragraphs = screen.getAllByTestId('parts-failure-predictive-model-paragraph');
    const unOrderedList = screen.getAllByTestId('parts-failure-predictive-model-list');

    expect(paragraphs.length).toBe(9);
    expect(unOrderedList.length).toBe(2);
  });
});
