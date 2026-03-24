import Box from '@mui/material/Box';
import { mapUnitDtoToUnit } from '@pmx-mui-models/index';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { GlobalUnitSelect } from '@ai2c/pmx-mui';

import data from '../../../helpers/units_data.json'

import '@testing-library/jest-dom';

const unitsData = data.map((unit) => mapUnitDtoToUnit(unit));
const favoriteData = unitsData.filter((unit) => unit.uic === 'W4JQAA');
const mockToggle = vi.fn();

/* Testing Component */
function TestingComponent() {
  return (
    <Box data-testid='test-component' component='div'>
      <GlobalUnitSelect units={unitsData} defaultValue={'W4JQAA'}></GlobalUnitSelect>
    </Box>
  );
}

/* Testing Component */
function TestingComponentWithFavorites() {
  return (
    <Box data-testid='test-component' component='div'>
      <GlobalUnitSelect
        favoriteUnits={favoriteData}
        units={unitsData}
        defaultValue={'W4JQAA'}
        handleToggleFavorite={mockToggle}
      ></GlobalUnitSelect>
    </Box>
  );
}

/* GlobalUnitSelect.test Tests */
describe('GlobalUnitSelect.testTest', () => {
  beforeEach(() => render(<TestingComponent />));

  test('global Unit Select renders with default value', () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();

    const label = screen.getByTestId('unit-select-label');
    expect(label).toHaveTextContent('TF Sinai');
  });

  test('tree select opens on unit select click', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();

    await userEvent.click(unitSelectButton);
    const selectTextField = screen.getByTestId('unit-select');
    expect(selectTextField).toBeInTheDocument();
  });

  test('tree select search works', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();

    await userEvent.click(unitSelectButton);
    const selectTextField = screen.getByTestId('unit-select-text-field').querySelector('input');
    expect(selectTextField).toBeInTheDocument();
  });

  test('dropdown menu opens', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();

    await userEvent.click(unitSelectButton);
    const selectTextField = screen.getByTestId('unit-select-text-field');
    expect(selectTextField).toBeInTheDocument();

    await userEvent.click(selectTextField);
    const applyButton = screen.getByTestId('unit-search');
    expect(applyButton).toBeInTheDocument();

    const searchField = screen.getByTestId('unit-search-field');
    expect(searchField).toBeInTheDocument();

    await userEvent.type(searchField, 'task');

    const taskForceTreeItemId = 'tree-item-W4JQAA';
    const taskForceTreeItem = screen.getByTestId(taskForceTreeItemId);
    expect(taskForceTreeItem).toBeInTheDocument();

    await userEvent.click(taskForceTreeItem);
    const selectedLabel = screen.getByTestId('unit-select-label');
    expect(selectedLabel).toBeInTheDocument();
    expect(selectedLabel).toHaveTextContent('TF Sinai');
  });

  test('does not enable apply button if no changes to selection', async () => {
    // Opens unit select
    const unitSelectButton = screen.getByTestId('unit-select-button');
    await userEvent.click(unitSelectButton);

    const selectedLabel = screen.getByTestId('input-unit-select-text-field');
    expect(selectedLabel).toHaveDisplayValue(['Task Force Sinai']);

    // Apply button is disabled until new selection
    const applyButton = screen.getByTestId('global-unit-select-apply-button');
    expect(applyButton).toBeInTheDocument();
    expect(applyButton).toBeDisabled();

    // Open unit select options menu
    const selectTextField = screen.getByTestId('unit-select-text-field');
    await userEvent.click(selectTextField);

    // Select item from unit options
    const treeItem = screen.getByText('Task Force Sinai');
    await userEvent.click(treeItem);

    // Apply button is still disabled after same selection
    expect(selectedLabel).toHaveDisplayValue(['Task Force Sinai']);
    expect(applyButton).toBeDisabled();
  });

  test('clicks apply button', async () => {
    // Opens unit select
    const unitSelectButton = screen.getByTestId('unit-select-button');
    await userEvent.click(unitSelectButton);

    // Apply button is disabled until new selection
    const applyButton = screen.getByTestId('global-unit-select-apply-button');
    expect(applyButton).toBeInTheDocument();
    expect(applyButton).toBeDisabled();

    // Open unit select options menu
    const selectTextField = screen.getByTestId('unit-select-text-field');
    await userEvent.click(selectTextField);

    // Select item from unit options
    const treeItem = screen.getByText('Aircraft in Transit');
    await userEvent.click(treeItem);

    const selectedLabel = screen.getByTestId('input-unit-select-text-field');
    expect(selectedLabel).toHaveDisplayValue(['Aircraft in Transit']);

    // Enables apply button and clicks
    expect(applyButton).toBeEnabled();
    await userEvent.click(applyButton);

    // Closes popover
    expect(applyButton).not.toBeInTheDocument();
});
});

/* GlobalUnitSelect with Favorites Tests */
describe('GlobalUnitSelect with Favorites Tests', () => {
  beforeEach(() => render(<TestingComponentWithFavorites />));

  test('Renders favorites section as part of dropdown', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();
    await userEvent.click(unitSelectButton);

    const selectTextField = screen.getByTestId('unit-select-text-field');
    expect(selectTextField).toBeInTheDocument();
    await userEvent.click(selectTextField);

    const favoritesTree = screen.getByTestId('favorites-tree-select');
    expect(favoritesTree).toBeInTheDocument();

    const favoritesTreeItem = screen.getByTestId('tree-item-favorites');
    expect(favoritesTreeItem).toBeInTheDocument();
  });

  test('Render unselected star icon for unfavorited unit', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();
    await userEvent.click(unitSelectButton);

    const selectTextField = screen.getByTestId('unit-select-text-field');
    expect(selectTextField).toBeInTheDocument();
    await userEvent.click(selectTextField);

    const taskForceTreeItem = screen.getByTestId('tree-item-TRANSIENT');
    expect(taskForceTreeItem).toBeInTheDocument();

    const starIcon = within(taskForceTreeItem).getByTestId('StarOutlineIcon');
    expect(starIcon).toBeInTheDocument();
  });

  test('Render selected star icon for favorited unit', async () => {
    const unitSelectButton = screen.getByTestId('unit-select-button');
    expect(unitSelectButton).toBeInTheDocument();

    await userEvent.click(unitSelectButton);
    const selectTextField = screen.getByTestId('unit-select-text-field');
    expect(selectTextField).toBeInTheDocument();

    await userEvent.click(selectTextField);
    const applyButton = screen.getByTestId('unit-search');
    expect(applyButton).toBeInTheDocument();

    const searchField = screen.getByTestId('unit-search-field');
    expect(searchField).toBeInTheDocument();

    await userEvent.type(searchField, favoriteData[0].uic);

    const taskForceTreeItem = screen.getByTestId(`tree-item-${favoriteData[0].uic}`);
    expect(taskForceTreeItem).toBeInTheDocument();

    const starIcon = within(taskForceTreeItem).getByTestId('StarIcon');
    expect(starIcon).toBeInTheDocument();
  });
});
