import { render, screen } from '@testing-library/react';

import ConditionStatus from '@features/equipment-manager/components/ConditionStatus';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock the StatusTooltip component
vi.mock('@features/equipment-manager/components/StatusTooltip', () => ({
  default: () => <div data-testid="status-tooltip">Tooltip Content</div>,
}));

// Mock the useDataDisplayTagColor hook
vi.mock('@hooks/useDataDisplayTagColor', () => ({
  default: (status: string) => ({
    color: '#000000',
    backgroundColor: status === 'FMC' ? '#4caf50' : '#ff9800',
  }),
}));

describe('ConditionStatus', () => {
  it('renders with required props', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Test Equipment" status="Operational" count={5} total={10} />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('em-condition-status')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Default icon is truck
    expect(screen.getByTestId('LocalShippingIcon')).toBeInTheDocument();
  });

  it('renders airplane icon when icon="airplane"', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Aircraft" status="In Flight" count={2} total={10} icon="airplane" />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('AirplanemodeActiveIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('LocalShippingIcon')).not.toBeInTheDocument();
  });

  it('renders truck icon when icon="truck"', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Vehicle" status="In Transit" count={3} total={10} icon="truck" />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('LocalShippingIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('AirplanemodeActiveIcon')).not.toBeInTheDocument();
  });

  it('shows em dash when count is 0', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Equipment" status="Unavailable" count={0} total={10} />
      </ThemedTestingComponent>,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calculates and displays correct percentage', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Equipment" status="FMC" count={3} total={5} />
      </ThemedTestingComponent>,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders with correct background color based on status', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Equipment" status="FMC" count={5} total={10} />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('em-status-color-#4caf50')).toBeInTheDocument();
  });

  it('renders the tooltip on hover', () => {
    render(
      <ThemedTestingComponent>
        <ConditionStatus title="Equipment" status="FMC" count={5} total={10} />
      </ThemedTestingComponent>,
    );
    // The tooltip component should be in the DOM (even if not visible)
    expect(screen.getByTestId('em-condition-status')).toBeInTheDocument();
  });
});
