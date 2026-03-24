import React from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

/**
 * @typedef SplitButtonProps
 * @prop { Array<string> } options - Split button options
 * @prop { function } handleClick - Callback function used to handle click event and passes button selection
 */
export type SplitButtonProps = {
  options: string[];

  handleClick: (value: string) => void;
};

/**
 * Split Button
 *
 * MUI Button Group arranged into a Split button
 *
 * @param { SplitButtonProps } props
 */
export const SplitButton: React.FC<SplitButtonProps> = ({ options, handleClick }) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleMenuItemClick = (_event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        data-testid="split-button-group"
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button data-testid="split-button-action-button" onClick={() => handleClick(options[selectedIndex])}>
          {options[selectedIndex]}
        </Button>
        <Button
          data-testid="split-button-dropdown-button"
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        data-testid="split-button-popper-menu"
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList data-testid="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      data-testid={`split-button-menu-item-${index}`}
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
