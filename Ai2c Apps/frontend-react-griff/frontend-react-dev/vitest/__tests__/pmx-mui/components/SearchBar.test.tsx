import { useState } from 'react';

import Box from '@mui/material/Box';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { SearchBar } from '@ai2c/pmx-mui/components/SearchBar';
import { slugify } from '@ai2c/pmx-mui/helpers/slugify';
import { getEchelonOptions } from '@ai2c/pmx-mui/models/Echelon';

/* Testing Component */
function TestingComponent() {
  const [selected, setSelected] = useState('');
  const options = getEchelonOptions();

  return (
    <Box data-testid="test-component" component="div">
      <SearchBar variant="underline" options={options} onChange={(_event, value) => setSelected(value.label)} />
      Result = {selected}
    </Box>
  );
}

/* Search Bar Test */
describe('SearchBarTest', () => {
  const options = getEchelonOptions().map((option) => ({
    key: slugify(option.label),
    ...option,
  }));

  test('is type HTML input component', async () => {
    render(<SearchBar options={options} />);
    const element: HTMLInputElement = screen.getByPlaceholderText('Search...');
    await userEvent.type(element, 'test');
    expect(element.value).toEqual('test');
  });

  test('has search icon', async () => {
    render(<SearchBar options={options} />);
    const element = screen.getByTestId('searchIcon');
    expect(element.classList).toContain('MuiSvgIcon-root');
  });

  test('has selection from dropdown options', async () => {
    render(<TestingComponent />);
    const element: HTMLInputElement = screen.getByPlaceholderText('Search...');
    await userEvent.click(element);
    await userEvent.click(screen.getByText('Battalion'));
    expect(element.value).toEqual('Battalion');
    expect(screen.getAllByText('Result = Battalion').length).toEqual(1);
  });
});
