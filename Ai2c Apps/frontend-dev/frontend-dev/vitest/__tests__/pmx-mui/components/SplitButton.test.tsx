import { useState } from 'react';

import { Box } from '@mui/material';
import { SplitButton } from '@pmx-mui-components/SplitButton';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import '@testing-library/jest-dom';

/* Testing Component */
function TestingComponent() {
  const [selected, setSelected] = useState('');
  const options = ['One', 'Two', 'Three'];

  return (
    <Box data-testid="test-component" component="div">
      <SplitButton options={options} handleClick={(value) => setSelected(value)} />
      Result = {selected}
    </Box>
  );
}

/* Split Button Test */
describe('SplitButtonTest', () => {
  beforeEach(() => render(<TestingComponent />));

  test('renders action button with first option selected', () => {
    const actionButton = screen.getByTestId('split-button-action-button');
    expect(actionButton?.innerHTML).toContain('One');
  });

  test('renders pop up menu on click', async () => {
    const dropdownButton = screen.getByTestId('split-button-dropdown-button');
    await userEvent.click(dropdownButton);
    const menu = screen.getByTestId('split-button-popper-menu');
    expect(menu?.innerHTML).toContain('One');
    expect(menu?.innerHTML).toContain('Two');
    expect(menu?.innerHTML).toContain('Three');
  });

  test('renders and selects third option form split button menu', async () => {
    const dropdownButton = screen.getByTestId('split-button-dropdown-button');
    await userEvent.click(dropdownButton);
    const menuButton = screen.getByTestId('split-button-menu-item-2');
    await userEvent.click(menuButton);
    const actionButton = screen.getByTestId('split-button-action-button');
    expect(actionButton?.innerHTML).toContain('Three');
    await userEvent.click(actionButton);

    const testComponent = screen.getByTestId('test-component');
    expect(testComponent?.innerHTML).toContain('Result = Three');
  });

  test('click away listener', async () => {
    const dropdownButton = screen.getByTestId('split-button-dropdown-button');
    await userEvent.click(dropdownButton);
    const menu = screen.getByTestId('split-button-popper-menu');
    expect(menu).toBeInTheDocument();
    const component = screen.getByTestId('test-component');
    await userEvent.click(component);
    expect(menu).not.toBeInTheDocument();
  });
});
