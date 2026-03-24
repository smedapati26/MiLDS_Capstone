import { render, screen } from '@testing-library/react';

import ModsTooltip from '@features/equipment-manager/aircraft/components/ModsTooltip';

import { IAircraftModification } from '@store/griffin_api/aircraft/models';

import { ThemedTestingComponent } from '@vitest/helpers';

describe('ModsTooltip', () => {
  const mockMods: IAircraftModification[] = [
    {
      modType: 'Engine Upgrade',
      value: 'V2.5',
      id: 1,
    },
    {
      modType: 'Avionics Package',
      value: 'Advanced Suite',
      id: 2,
    },
    {
      modType: 'Weapon System',
      value: 'Hellfire Missiles',
      id: 3,
    },
  ];

  it('renders the tooltip with serial number', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={mockMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('12-3456 Modification & Kits')).toBeInTheDocument();
  });

  it('renders all modification items', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={mockMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('Engine Upgrade:')).toBeInTheDocument();
    expect(screen.getByText('V2.5')).toBeInTheDocument();

    expect(screen.getByText('Avionics Package:')).toBeInTheDocument();
    expect(screen.getByText('Advanced Suite')).toBeInTheDocument();

    expect(screen.getByText('Weapon System:')).toBeInTheDocument();
    expect(screen.getByText('Hellfire Missiles')).toBeInTheDocument();
  });

  it('renders with empty mods array', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={[]} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('12-3456 Modification & Kits')).toBeInTheDocument();
    // Should not render any modification items
    expect(screen.queryByText(':')).not.toBeInTheDocument();
  });

  it('renders with undefined mods', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={undefined} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('12-3456 Modification & Kits')).toBeInTheDocument();
    // Should not render any modification items
    expect(screen.queryByText(':')).not.toBeInTheDocument();
  });

  it('renders with single modification', () => {
    const singleMod: IAircraftModification[] = [
      {
        modType: 'Radar System',
        value: 'APG-79',
        id: 1,
      },
    ];

    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="98-7654" mods={singleMod} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('98-7654 Modification & Kits')).toBeInTheDocument();
    expect(screen.getByText('Radar System:')).toBeInTheDocument();
    expect(screen.getByText('APG-79')).toBeInTheDocument();
  });

  it('renders with different serial numbers', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="AF-001" mods={mockMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('AF-001 Modification & Kits')).toBeInTheDocument();
  });

  it('handles modifications with duplicate modTypes', () => {
    const duplicateMods: IAircraftModification[] = [
      {
        modType: 'Software Update',
        value: 'v1.0',
        id: 1,
      },
      {
        modType: 'Software Update',
        value: 'v2.0',
        id: 2,
      },
    ];

    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={duplicateMods} />
      </ThemedTestingComponent>,
    );

    const softwareLabels = screen.getAllByText('Software Update:');
    expect(softwareLabels).toHaveLength(2);
    expect(screen.getByText('v1.0')).toBeInTheDocument();
    expect(screen.getByText('v2.0')).toBeInTheDocument();
  });

  it('renders modifications with numeric values', () => {
    const numericMods: IAircraftModification[] = [
      {
        modType: 'Fuel Capacity',
        value: '5000',
        id: 1,
      },
    ];

    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={numericMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('Fuel Capacity:')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  it('renders modifications with special characters in values', () => {
    const specialCharMods: IAircraftModification[] = [
      {
        modType: 'Configuration',
        value: 'Type-A/B (Modified)',
        id: 1,
      },
    ];

    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={specialCharMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('Configuration:')).toBeInTheDocument();
    expect(screen.getByText('Type-A/B (Modified)')).toBeInTheDocument();
  });

  it('renders with long serial number', () => {
    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="USAF-MQ9-2024-12345" mods={mockMods} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('USAF-MQ9-2024-12345 Modification & Kits')).toBeInTheDocument();
  });

  it('renders all modifications in correct order', () => {
    const orderedMods: IAircraftModification[] = [
      { modType: 'First', value: '1', id: 1 },
      {
        modType: 'Second',
        value: '2',
        id: 2,
      },
      { modType: 'Third', value: '3', id: 3 },
    ];

    render(
      <ThemedTestingComponent>
        <ModsTooltip serial="12-3456" mods={orderedMods} />
      </ThemedTestingComponent>,
    );

    const labels = screen.getAllByText(/:/);
    expect(labels[0]).toHaveTextContent('First:');
    expect(labels[1]).toHaveTextContent('Second:');
    expect(labels[2]).toHaveTextContent('Third:');
  });
});
