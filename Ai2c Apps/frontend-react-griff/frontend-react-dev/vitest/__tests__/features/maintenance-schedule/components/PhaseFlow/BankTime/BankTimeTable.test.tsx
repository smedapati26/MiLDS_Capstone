import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import BankTimeTable from '@features/maintenance-schedule/components/PhaseFlow/BankTime/BankTimeTable';

import { IAircraftBankPercentage } from '@store/griffin_api/aircraft/models';

const sampleOtherBankTimeData: IAircraftBankPercentage[] = [
  {
    key: 'test',
    bankPercentage: 0.54,
  },
  {
    key: 'test1',
    bankPercentage: 0.55,
  },
  {
    key: 'test2',
    bankPercentage: 0.64,
  },
];

describe('BankTimeTable', () => {
  it('test rendering', () => {
    render(<BankTimeTable data={sampleOtherBankTimeData} />);

    expect(screen.getByTestId('bank-time-table')).toBeInTheDocument();

    const rows = screen.getAllByTestId('bank-time-table-row');

    expect(rows).toHaveLength(3);
  });
});
