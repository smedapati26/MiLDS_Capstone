import { ThemedTestingComponent } from 'vitest/helpers/ThemedTestingComponent';

import { render, screen } from '@testing-library/react';

import { QualitativeStackItem } from '@features/daily-status-report/components/OperationalReadinessStatus/QualitativeStackItem';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IStatusStatInfo } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

/* QualitativeStackItem Tests */
describe('QualitativeStackItemTest', () => {
  const stat: IStatusStatInfo = {
    status: OperationalReadinessStatusEnum.FMC,
    count: 10,
    percentage: 0.5,
    data: [],
  };

  beforeEach(() =>
    render(
      <ThemedTestingComponent>
        <QualitativeStackItem statInfo={stat} />
      </ThemedTestingComponent>,
    ),
  );

  it('renders test component', () => {
    const component = screen.getByTestId('operational-readiness-status-fmc');
    expect(component).toBeInTheDocument();
  });
});
