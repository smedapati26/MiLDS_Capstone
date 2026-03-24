import { Box } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ClosableAlert } from '@ai2c/pmx-mui/components/ClosableAlert';

/* Testing Component */
function TestingComponent() {
  return (
    <Box data-testid="test-component" component="div">
      <ClosableAlert severity="error">ERROR</ClosableAlert>
    </Box>
  );
}

/* Closable Alert Test */
describe('ClosableAlertTest', () => {
  beforeEach(() => render(<TestingComponent />));

  test('renders transition alert', () => {
    const alert = screen.getByTestId('transition-alert');
    expect(alert?.innerHTML).toContain('ERROR');
  });

  test('closes transition alert', async () => {
    const alertContainer = screen.getByTestId('transition-alert');
    const closeButton = screen.getByTestId('transition-alert-close-button');
    await userEvent.click(closeButton);
    expect(alertContainer.style.minHeight).toEqual('0px');
  });
});
