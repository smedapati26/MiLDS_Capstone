import { vi } from 'vitest';

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import { render, screen } from '@testing-library/react';

import ConditionTooltip from '@features/equipment-manager/components/ConditionTooltip';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock OrStatusTableCell component
vi.mock('@components/data-tables', () => ({
  OrStatusTableCell: ({ status }: { status: string }) => <div data-testid="or-status-table-cell">{status}</div>,
}));

describe('ConditionTooltip', () => {
  const defaultProps = {
    title: 'MQ-9 Reaper',
    status: 'FMC',
    icon: <AirplanemodeActiveIcon data-testid="test-icon" />,
    total: 5,
  };

  it('renders the tooltip card', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-condition-status-tooltip')).toBeInTheDocument();
  });

  it('renders the title with "Status" suffix', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('MQ-9 Reaper Status')).toBeInTheDocument();
  });

  it('renders the OrStatusTableCell with correct status', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    const statusCell = screen.getByTestId('or-status-table-cell');
    expect(statusCell).toBeInTheDocument();
    expect(statusCell).toHaveTextContent('FMC');
  });

  it('renders the provided icon', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders the aircraft count label', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('# of Aircraft in Status:')).toBeInTheDocument();
  });

  it('renders the total count', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders with different status values', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} status="PMC" />
      </ThemedTestingComponent>,
    );

    const statusCell = screen.getByTestId('or-status-table-cell');
    expect(statusCell).toHaveTextContent('PMC');
  });

  it('renders with different total values', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} total={10} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders with different title values', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} title="RQ-4 Global Hawk" />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('RQ-4 Global Hawk Status')).toBeInTheDocument();
  });

  it('renders with zero total', () => {
    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} total={0} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;

    render(
      <ThemedTestingComponent>
        <ConditionTooltip {...defaultProps} icon={customIcon} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
  });
});
