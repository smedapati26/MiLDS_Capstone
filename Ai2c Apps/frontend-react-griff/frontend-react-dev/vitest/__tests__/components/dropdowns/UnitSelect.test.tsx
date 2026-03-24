/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UnitSelect } from '@components/dropdowns/UnitSelect';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

// Mock IUnitBrief data
const mockUnits = [
  {
    uic: '12345',
    echelon: 'DIVISION' as any,
    component: 'Army',
    level: 0,
    shortName: 'Unit A',
    displayName: 'Unit A Display',
    nickName: 'UA',
  },
  {
    uic: '67890',
    echelon: 'BRIGADE' as any,
    component: 'Army',
    level: 1,
    shortName: 'Unit B',
    displayName: 'Unit B Display',
    nickName: 'UB',
    parentUic: '12345',
  },
  {
    uic: '11111',
    echelon: 'DIVISION' as any,
    component: 'Army',
    level: 0,
    shortName: 'Unit C',
    displayName: 'Unit C Display',
    nickName: 'UC',
  },
];

describe('UnitSelect', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the TextField with correct label and initial value', () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    expect(textField).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();
    const input = textField.querySelector('input');
    expect(input).toHaveValue('');
  });

  it('renders with provided value', () => {
    const selectedUnit = mockUnits[0];
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} value={selectedUnit} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    const input = textField.querySelector('input');
    expect(input).toHaveValue(selectedUnit.displayName);
  });

  it('opens popover when TextField is clicked', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    const popover = screen.getByTestId('unit-search');
    expect(popover).toBeInTheDocument();
  });

  it('filters units based on search input', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    const searchField = screen.getByTestId('unit-search-field');
    await user.type(searchField, 'Unit A');

    await waitFor(() => {
      expect(screen.getByText('Unit A Display')).toBeInTheDocument();
      expect(screen.queryByText('Unit C Display')).not.toBeInTheDocument();
    });
  });

  it('selects a unit and calls onChange when tree item is clicked', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    const treeItemLabel = screen.getByText('Unit A Display');
    await user.click(treeItemLabel);

    expect(mockOnChange).toHaveBeenCalledWith(mockUnits[0]);
    const input = textField.querySelector('input');
    expect(input).toHaveValue('Unit A Display');
  });

  it('clears search and resets filters when clear icon is clicked', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    const searchField = screen.getByTestId('unit-search-field');
    await user.type(searchField, 'Unit A');

    await waitFor(() => {
      expect(screen.getByText('Unit A Display')).toBeInTheDocument();
    });

    const clearIcon = screen.getByTestId('unit-search-field').querySelectorAll('svg')[1];
    if (clearIcon) {
      await user.click(clearIcon);
    }

    await waitFor(() => {
      expect(screen.getByText('Unit A Display')).toBeInTheDocument();
      expect(screen.getByText('Unit C Display')).toBeInTheDocument();
    });
  });

  it('does not open popover when readOnly is true', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} readOnly />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    expect(screen.queryByTestId('unit-search')).not.toBeInTheDocument();
  });

  it('disables the TextField when disabled is true', () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} disabled />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    const input = textField.querySelector('input');
    expect(input).toBeDisabled();
  });

  it('renders tree items with hierarchy', async () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    await user.click(textField);

    expect(screen.getByText('Unit A Display')).toBeInTheDocument();
    expect(screen.getByText('Unit B Display')).toBeInTheDocument();
    expect(screen.getByText('Unit C Display')).toBeInTheDocument();
  });

  it('shows error state when error prop is true', () => {
    render(
      <ThemedTestingComponent>
        <UnitSelect units={mockUnits} onChange={mockOnChange} error helperText="Error message" />
      </ThemedTestingComponent>,
    );

    const textField = screen.getByTestId('unit-select-text-field');
    const input = textField.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
