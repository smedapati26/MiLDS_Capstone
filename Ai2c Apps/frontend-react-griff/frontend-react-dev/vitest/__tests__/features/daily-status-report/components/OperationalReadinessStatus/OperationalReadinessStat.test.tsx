import { ThemedTestingComponent } from 'vitest/helpers/ThemedTestingComponent';

import { render, screen } from '@testing-library/react';

import { OperationalReadinessStat } from '@features/daily-status-report/components/OperationalReadinessStatus/OperationalReadinessStat';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IStatusStatInfo } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

/* OperationalReadinessStat Tests */
describe('OperationalReadinessStatTest', () => {
  const stat: IStatusStatInfo = {
    status: OperationalReadinessStatusEnum.FMC,
    count: 10,
    percentage: 0.5,
    data: [],
  };

  beforeEach(() =>
    render(
      <ThemedTestingComponent>
        <OperationalReadinessStat statInfo={stat} totalAircraft={20} />
      </ThemedTestingComponent>,
    ),
  );

  it('renders Operational Readiness Status fmc status', () => {
    const component = screen.getByTestId('operational-readiness-status-fmc');
    expect(component).toBeInTheDocument();

    const percentage = screen.getByTestId('operational-readiness-status-fmc-percentage');
    expect(percentage).toBeInTheDocument();
    expect(percentage.innerHTML).toContain('50%');
  });
});
