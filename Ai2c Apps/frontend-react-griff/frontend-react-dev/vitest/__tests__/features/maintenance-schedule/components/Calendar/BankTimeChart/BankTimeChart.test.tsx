import { render } from '@testing-library/react';

import { BankTimeChart } from '@features/maintenance-schedule/components/Calendar';

import { mockBankTimeForecast } from '@vitest/mocks/griffin_api_handlers/events/mock_data';

import '@testing-library/jest-dom';

describe('BankTimeChart', () => {
  it('renders the BankTimeChart component', () => {
    expect(render(<BankTimeChart data={[mockBankTimeForecast]} />)).toBeTruthy();
  });
});
