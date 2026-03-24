import { useState } from 'react';

import { Box } from '@mui/material';
import { mapUnitDtoToUnit, Unit } from '@pmx-mui-models/index';
import type { Meta, StoryObj } from '@storybook/react';

import data from '../../../vitest/helpers/units_data.json';
import { GlobalUnitSelect, GlobalUnitSelectProps } from '../components/GlobalUnitSelect';

// Helper Variables and Functions
const unitsData = data.map((unit) => mapUnitDtoToUnit(unit));
const unitUic = 'W4JQAA';

function getDefaultUnit(selectedUnit: string | Unit | undefined) {
  if (typeof selectedUnit === 'string') {
    return unitsData.find((unit) => unit.uic === selectedUnit);
  }
  return selectedUnit;
}

// Storybook Variables
const meta: Meta<typeof GlobalUnitSelect> = {
  title: 'Components/GlobalUnitSelect',
  component: GlobalUnitSelect,
};

export default meta;
type Story = StoryObj<typeof GlobalUnitSelect>;

const Template = (args: GlobalUnitSelectProps) => {
  const [defaultUnit, setDefaultUnit] = useState<Unit | undefined>(getDefaultUnit(args.defaultValue));
  const [favoriteUnits, setFavoriteUnits] = useState<Unit[] | undefined>(args.favoriteUnits);

  // Handling unit selection change from Global Unit Select
  const handleUnitOnChange = (selection: Unit) => {
    setDefaultUnit(selection);
  };

  // Toggles favorite units from Global Unit Select
  const handleToggleFavorite = (selection: Unit) => {
    if (favoriteUnits) {
      if (favoriteUnits.find((unit) => unit.uic === selection.uic)) {
        setFavoriteUnits(favoriteUnits.filter((unit) => unit.uic !== selection.uic));
      } else {
        setFavoriteUnits([...favoriteUnits, selection]);
      }
    }
  };

  return (
    <Box>
      <GlobalUnitSelect
        units={args.units}
        defaultValue={defaultUnit}
        handleOnChange={handleUnitOnChange}
        favoriteUnits={favoriteUnits}
        handleToggleFavorite={handleToggleFavorite}
      />
    </Box>
  );
};

// Story Declarations
export const Default: Story = {
  render: Template,
  args: {
    units: unitsData,
    defaultValue: unitUic,
  },
};

export const Favorites: Story = {
  render: Template,
  args: {
    units: unitsData,
    defaultValue: unitUic,
    favoriteUnits: unitsData.filter((unit) => unit.uic === unitUic),
  },
};
