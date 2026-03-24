/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import UasPaper, { UasPaperData } from '@features/equipment-manager/uas/components/UasPaper';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock StatusCard to inspect props
vi.mock('@features/equipment-manager/components/StatusCard', () => ({
  default: (props: any) => (
    <div data-testid={`status-card-${props.status}`}>
      {props.title}:{props.label}:{props.status}:{props.total}:{props.percentage}
    </div>
  ),
}));

// Mock ReadyToLaunch to inspect props
vi.mock('@features/equipment-manager/components/ReadyToLaunch', () => ({
  default: (props: any) => (
    <div data-testid={`ready-to-launch-${props.title}`}>
      {props.title}:{props.value}
    </div>
  ),
}));

describe('UasPaper', () => {
  const data: UasPaperData = {
    model: 'MQ-9 Reaper',
    rtl: 2,
    nrtl: 1,
    inPhase: 0,
    total: 5,
    fmc: 3,
    pmc: 1,
    nmc: 1,
    dade: 0,
  };

  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <UasPaper data={data} />
      </ThemedTestingComponent>,
    );
  });

  it('renders the model name', () => {
    expect(screen.getByText('MQ-9 Reaper')).toBeInTheDocument();
  });

  it('renders ReadyToLaunch components with correct props', () => {
    expect(screen.getByTestId('ready-to-launch-RTL')).toHaveTextContent('RTL:2');
    expect(screen.getByTestId('ready-to-launch-NRTL')).toHaveTextContent('NRTL:1');
  });

  it('renders StatusCard components with correct props', () => {
    expect(screen.getByTestId('status-card-FMC')).toHaveTextContent('MQ-9 Reaper:UAS:FMC:3:60%');
    expect(screen.getByTestId('status-card-PMC')).toHaveTextContent('MQ-9 Reaper:UAS:PMC:1:20%');
    expect(screen.getByTestId('status-card-NMC')).toHaveTextContent('MQ-9 Reaper:UAS:NMC:1:20%');
    expect(screen.getByTestId('status-card-DADE')).toHaveTextContent('MQ-9 Reaper:UAS:DADE:0:0%');
  });

  it('renders the Paper with the correct test id', () => {
    expect(screen.getByTestId('em-uas-paper')).toBeInTheDocument();
  });
});
