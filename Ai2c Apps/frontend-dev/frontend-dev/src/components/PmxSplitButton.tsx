import React, { ReactNode } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';

/**
 * @typedef OptionType
 * Represents an individual menu option, with optional nested child options.
 *
 * @prop {string} label - The label of the menu option.
 * @prop {OptionType[]} [children] - Optional child options for nested menus.
 */
type OptionType = {
  label: string;
  children?: OptionType[];
};

/**
 * @typedef SplitButtonProps
 * Props for the PmxSplitButton component.
 *
 * @prop {string} buttonTitle - Title displayed on the main button.
 * @prop {OptionType[]} options - List of menu options to display.
 * @prop {ReactNode} [startIcon] - Optional icon displayed at the start of the button.
 * @prop {function(string): void} handleClick - Callback triggered when a menu option is selected.
 */
export type SplitButtonProps = {
  buttonTitle: string;
  options: OptionType[];
  startIcon?: ReactNode;
  disabled?: boolean;
  handleClick: (value: string) => void;
};

/**
 * PmxSplitButton Component
 *
 * A split button component with a dropdown menu, supporting nested child menus for options.
 *
 * @param {SplitButtonProps} props - Component props.
 * @returns {React.JSX.Element} Rendered PmxSplitButton component.
 */
const PmxSplitButton = ({
  buttonTitle,
  options,
  handleClick,
  startIcon,
  disabled = false,
}: SplitButtonProps): React.JSX.Element => {
  const [open, setOpen] = React.useState(false); // State for controlling the parent menu
  const [nestedOpen, setNestedOpen] = React.useState(false); // State for controlling nested child menus
  const anchorRef = React.useRef<HTMLDivElement>(null); // Reference for parent button group
  const nestedAnchorRef = React.useRef<HTMLLIElement | null>(null); // Reference for parent menu item
  const [nestedOptions, setNestedOptions] = React.useState<OptionType[] | null>(null); // Stores nested child options

  /**
   * Handles menu item click.
   * If the clicked option has children, opens the nested menu. Otherwise, calls the handleClick callback.
   *
   * @param {React.MouseEvent<HTMLLIElement, MouseEvent>} _event - Click event.
   * @param {OptionType} option - Selected menu option.
   */
  const handleMenuItemClick = (_event: React.MouseEvent<HTMLLIElement>, option: OptionType) => {
    if (option.children) {
      setNestedOptions(option.children); // Open nested menu
      setNestedOpen(true);
    } else {
      handleClick(option.label); // Trigger callback for regular options
      setOpen(false);
    }
  };

  /**
   * Toggles the visibility of the parent menu.
   */
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  /**
   * Closes both the parent menu and any nested menus.
   */
  const handleClose = () => {
    setOpen(false);
    setNestedOpen(false);
  };

  return (
    <>
      {/* Main button group */}
      <ButtonGroup variant="contained" ref={anchorRef} aria-label="Button group with nested menus" disabled={disabled}>
        <Button onClick={() => handleClick(buttonTitle)} {...(startIcon && { startIcon })} aria-label="main-btn">
          {buttonTitle}
        </Button>
        <Button size="small" aria-haspopup="menu" onClick={handleToggle} aria-label="split-button-dropdown-button">
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      {/* Parent menu */}
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal sx={{ zIndex: 10 }}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      onClick={(event) => handleMenuItemClick(event, option)}
                      ref={(el) => {
                        if (option.children) nestedAnchorRef.current = el;
                      }}
                    >
                      {option.label}
                      {option.children?.length && <ArrowRightIcon fontSize="small" />}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Nested child menu */}
      {nestedOptions && (
        <Popper
          open={nestedOpen}
          anchorEl={nestedAnchorRef.current}
          role={undefined}
          transition
          disablePortal
          sx={{ zIndex: 10 }}
          placement="right-start" // Ensures nested menu appears inline to the right
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'right' ? 'left center' : 'right center',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    {nestedOptions.map((nestedOption) => (
                      <MenuItem
                        key={nestedOption.label}
                        onClick={() => {
                          handleClick(nestedOption.label);
                          handleClose();
                        }}
                      >
                        {nestedOption.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </>
  );
};

export default PmxSplitButton;
