import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { UASAccordions } from '@features/daily-status-report/components/EquipmentDetails/UAS/UASAccordions';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

// Mock the external components
vi.mock('@components/data-tables', () => ({
  PmxTableWrapper: ({ leftControls, table }: { leftControls: React.ReactNode; table: React.ReactNode }) => (
    <div data-testid="pmx-table-wrapper">
      <div data-testid="left-controls">{leftControls}</div>
      <div data-testid="table">{table}</div>
    </div>
  ),
}));

vi.mock('@components/inputs', () => ({
  PmxToggleButtonGroup: ({
    value,
    options,
    onChange,
  }: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
  }) => (
    <div data-testid="pmx-toggle-button-group">
      <span data-testid="toggle-value">{value}</span>
      <span data-testid="toggle-options">{options.join(',')}</span>
      <button data-testid="toggle-button" onClick={() => onChange('Aircraft')}>
        Toggle
      </button>
    </div>
  ),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

describe('UASAccordions', () => {
  const mockOnToggle = vi.fn();
  const mockChildren = <div data-testid="mock-children">Mock Table Content</div>;

  it('renders the PmxTableWrapper with left controls and table', () => {
    renderWithTheme(<UASAccordions onToggle={mockOnToggle}>{mockChildren}</UASAccordions>);

    expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('left-controls')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('renders the PmxToggleButtonGroup with correct props', () => {
    renderWithTheme(<UASAccordions onToggle={mockOnToggle}>{mockChildren}</UASAccordions>);

    expect(screen.getByTestId('pmx-toggle-button-group')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-value')).toHaveTextContent('UAS');
    expect(screen.getByTestId('toggle-options')).toHaveTextContent('Aircraft,UAS,AGSE');
  });

  it('passes children to the table prop of PmxTableWrapper', () => {
    renderWithTheme(<UASAccordions onToggle={mockOnToggle}>{mockChildren}</UASAccordions>);

    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
    expect(screen.getByText('Mock Table Content')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    renderWithTheme(<UASAccordions onToggle={mockOnToggle}>{mockChildren}</UASAccordions>);

    const toggleButton = screen.getByTestId('toggle-button');
    toggleButton.click();

    expect(mockOnToggle).toHaveBeenCalledWith('Aircraft');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('renders without children', () => {
    renderWithTheme(<UASAccordions onToggle={mockOnToggle} />);

    expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('left-controls')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });
});
