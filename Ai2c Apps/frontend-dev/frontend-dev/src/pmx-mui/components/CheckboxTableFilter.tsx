import React from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';

import { slugify } from '../helpers/slugify';
import { Popover } from './Popover';

/**
 * @typedef CheckboxOption
 * @prop { string } label
 * @prop { string } value
 */
export type CheckboxOption = {
  label: string;
  value: string;
};

/**
 * @typedef CheckboxTableFilterProps
 * @prop { string } label - Unit label
 * @prop { Array<CheckboxOption> } options - Unit label
 * @prop { Function } onCheckboxChange - Callback function to get selected values
 */
export type CheckboxTableFilterProps = {
  label: string;
  options: Array<CheckboxOption>;

  onCheckboxChange: (_selected: Array<string>) => void;
};

/**
 * Checkbox Filter
 *
 * @param { CheckboxTableFilterProps } props
 */
export const CheckboxTableFilter: React.FC<CheckboxTableFilterProps> = ({ label, options, onCheckboxChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selected, setSelected] = React.useState<Array<string>>([]);
  const [displayFilter, setDisplayFilter] = React.useState<boolean>(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setDisplayFilter(!displayFilter || selected.length !== 0);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    selected.length === 0 && setDisplayFilter(false);
  };

  const handleCheckboxChange = (event: SelectChangeEvent) => {
    const clicked = event.target.value;
    const changes = selected.includes(clicked)
      ? [...selected.filter((value) => value !== clicked)]
      : [...selected, clicked];

    setDisplayFilter(displayFilter || selected.length !== 0);
    setSelected(changes);
    onCheckboxChange(changes);
  };

  return (
    <div>
      <Box
        id={`checkbox-table-filter-${slugify(label)}`}
        data-testid={`checkbox-table-filter-${slugify(label)}`}
        onClick={handleClick}
        sx={{
          '*': {
            opacity: displayFilter ? 1 : 0,
            transition: 'opacity 0.25s ease-in-out',
          },
          '&:hover *': {
            opacity: displayFilter ? 1 : 0.8,
            transition: 'opacity 0.25s ease-in-out',
          },
        }}
      >
        {label}
        <IconButton
          id="basic-button"
          aria-controls={open ? 'filter-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            ml: '3px',
            transition: 'opacity 0.25s ease-in-out',
            opacity: displayFilter ? 1 : 0.5,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
          disableRipple
        >
          <FilterListIcon />
        </IconButton>
      </Box>
      <FormGroup>
        <Popover
          id="filter-menu"
          data-testid="filter-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              id={`checkbox-table-filter-${slugify(option.label)}`}
              data-testid={`checkbox-table-filter-${slugify(option.label)}`}
              sx={{ py: 0 }}
            >
              <FormControlLabel
                control={<Checkbox onChange={handleCheckboxChange} />}
                value={option.value}
                label={option.label}
                checked={selected.includes(option.value)}
              />
            </MenuItem>
          ))}
        </Popover>
      </FormGroup>
    </div>
  );
};
