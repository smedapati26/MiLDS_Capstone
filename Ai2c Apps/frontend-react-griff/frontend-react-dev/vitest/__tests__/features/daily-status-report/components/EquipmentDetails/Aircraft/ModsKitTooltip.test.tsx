import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { ModsKitTooltip } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/ModsKitTooltip';

import { IMod } from '@store/griffin_api/auto_dsr/models';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock PmxClickableTooltip component
vi.mock('@components/data-tables', () => ({
  PmxClickableTooltip: ({ value, title }: { value: React.ReactNode; title: React.ReactNode }) => (
    <div data-testid="pmx-clickable-tooltip">
      <span data-testid="tooltip-value">{value}</span>
      <div data-testid="tooltip-title">{title}</div>
    </div>
  ),
}));

describe('ModsKitTooltip', () => {
  const mockMods: IMod[] = [
    { modType: 'Engine Upgrade', value: 'V2.0' },
    { modType: 'Avionics Kit', value: 'Installed' },
    { modType: 'Engine Upgrade', value: 'V1.5' },
    { modType: 'Radar System', value: " " },
    { modType: 'Fuel Tank', value: 'Extended' },
  ];

  it('renders the total count of equipped mods as the tooltip value', () => {
    renderWithProviders(<ModsKitTooltip mods={mockMods} />);

    const tooltipValue = screen.getByTestId('tooltip-value');
    expect(tooltipValue).toHaveTextContent('5'); // 5 equipped mods
  });

  it('displays the correct title with "Modifications & Kits"', () => {
    renderWithProviders(<ModsKitTooltip mods={mockMods} />);

    const tooltipTitle = screen.getByTestId('tooltip-title');
    expect(tooltipTitle).toHaveTextContent('Modifications & Kits');
  });

  it('groups mods by type and displays counts correctly', () => {
    renderWithProviders(<ModsKitTooltip mods={mockMods} />);

    const tooltipTitle = screen.getByTestId('tooltip-title');

    // Check that the title contains the expected text
    expect(tooltipTitle).toHaveTextContent('Modifications & Kits');
    expect(tooltipTitle).toHaveTextContent('Engine Upgrade');
    expect(tooltipTitle).toHaveTextContent('2');
    expect(tooltipTitle).toHaveTextContent('Avionics Kit');
    expect(tooltipTitle).toHaveTextContent('Fuel Tank');
    expect(tooltipTitle).toHaveTextContent('Radar System');
  });

  it('renders 0 when mods array is empty', () => {
    renderWithProviders(<ModsKitTooltip mods={[]} />);

    const tooltipValue = screen.getByTestId('tooltip-value');
    expect(tooltipValue).toHaveTextContent('0');
  });

  it('handles mods with only one type correctly', () => {
    const singleTypeMods: IMod[] = [
      { modType: 'Engine Upgrade', value: 'V2.0' },
      { modType: 'Engine Upgrade', value: 'V2.1' },
      { modType: 'Engine Upgrade', value: 'V2.2' },
    ];

    renderWithProviders(<ModsKitTooltip mods={singleTypeMods} />);

    const tooltipValue = screen.getByTestId('tooltip-value');
    expect(tooltipValue).toHaveTextContent('3');

    const tooltipTitle = screen.getByTestId('tooltip-title');
    expect(tooltipTitle).toHaveTextContent('Modifications & Kits');
    expect(tooltipTitle).toHaveTextContent('V2.');
  });
});
