import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import InspectionSelection from '@features/maintenance-schedule/components/Calendar/AddEditMaintenance/InspectionSelection';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';
import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

// Mock PmxButtonGroupSelector
vi.mock('@components/PmxButtonGroupSelector', () => ({
  default: vi.fn(() => <div data-testid="pmx-button-group-selector" />),
}));

const MockPmxButtonGroupSelector = vi.mocked(await import('@components/PmxButtonGroupSelector')).default;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProviderWrapper>
    <ThemedTestingComponent>{children}</ThemedTestingComponent>
  </ProviderWrapper>
);

describe('InspectionSelection', () => {
  const mockSetSelected = vi.fn();

  const sampleOptions = [
    { id: 1, value: 'Inspection 1' },
    { id: 2, value: 'Inspection 2' },
    { id: 3, value: 'Inspection 3' },
    { id: 4, value: 'Inspection 4' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No upcoming inspections found." when options is empty', () => {
    render(
      <TestWrapper>
        <InspectionSelection options={[]} selectedInspection={[]} setSelectedInspection={mockSetSelected} />
      </TestWrapper>,
    );

    expect(screen.getByText('No upcoming inspections found.')).toBeInTheDocument();
    expect(MockPmxButtonGroupSelector).not.toHaveBeenCalled();
  });

  it('renders title and selectors when options are provided', () => {
    render(
      <TestWrapper>
        <InspectionSelection options={sampleOptions} selectedInspection={1} setSelectedInspection={mockSetSelected} />
      </TestWrapper>,
    );

    expect(screen.getByText('Select maintenance(s) to schedule')).toBeInTheDocument();
    expect(MockPmxButtonGroupSelector).toHaveBeenCalledTimes(2);
  });

  it('renders upcoming selector with correct props', () => {
    render(
      <TestWrapper>
        <InspectionSelection options={sampleOptions} selectedInspection={1} setSelectedInspection={mockSetSelected} />
      </TestWrapper>,
    );

    expect(MockPmxButtonGroupSelector).toHaveBeenCalledWith(
      expect.objectContaining({
        selected: 1,
        setSelected: mockSetSelected,
        options: sampleOptions.slice(0, 3),
        label: 'Upcoming',
        exclusive: true,
      }),
      expect.anything(),
    );
  });

  it('renders other selector with correct props when otherGroup exists', () => {
    render(
      <TestWrapper>
        <InspectionSelection options={sampleOptions} selectedInspection={1} setSelectedInspection={mockSetSelected} />
      </TestWrapper>,
    );

    expect(MockPmxButtonGroupSelector).toHaveBeenCalledWith(
      expect.objectContaining({
        selected: 1,
        setSelected: mockSetSelected,
        options: sampleOptions.slice(3),
        label: 'Other',
        exclusive: true,
      }),
      expect.anything(),
    );
  });

  it('does not render other selector when otherGroup is empty', () => {
    const shortOptions = sampleOptions.slice(0, 3);

    render(
      <TestWrapper>
        <InspectionSelection options={shortOptions} selectedInspection={1} setSelectedInspection={mockSetSelected} />
      </TestWrapper>,
    );

    expect(MockPmxButtonGroupSelector).toHaveBeenCalledTimes(1);
    expect(MockPmxButtonGroupSelector).toHaveBeenCalledWith(
      expect.objectContaining({
        options: shortOptions,
        label: 'Upcoming',
      }),
      expect.anything(),
    );
  });
});
