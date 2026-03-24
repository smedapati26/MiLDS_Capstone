/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useRef, useState } from 'react';

import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  CircularProgress,
  CSSProperties,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
} from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

/**
 * Dropdown options can be simple strings or objects with labels, values, and optional children.
 */
export type DropdownOption =
  | {
      label: string;
      value: string;
      children?: DropdownOption[];
    }
  | string;

/**
 * Props for the PmxDropdown component.
 * @typedef {Object} PmxDropdownProps
 * @property {DropdownOption[]} options - The options to display in the dropdown.
 * @property {string | string[]} value - The currently selected value(s).
 * @property {string} label - The label for the dropdown.
 * @property {boolean} [loading=false] - Whether the dropdown is in a loading state.
 * @property {boolean} [multiple=false] - Whether the dropdown allows multiple selections.
 * @property {function(string | string[]): void} onChange - Callback invoked when the dropdown value changes.
 * @property {CSSProperties} [dropdownSx] - Custom styles for the dropdown element.
 * @property {CSSProperties} [containerSx] - Custom styles for the container element.
 * @property {boolean} [error=false] - Whether the dropdown is in an error state.
 * @property {string} [helperText=''] - Helper text to display below the dropdown.
 * @property {boolean} [shrinkLabel=false] - Whether the dropdown label is shrunken.
 */
interface PmxDropdownProps {
  options: DropdownOption[];
  value: string | string[] | undefined;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  dropdownSx?: CSSProperties;
  containerSx?: CSSProperties;
  error?: boolean;
  helperText?: string;
  renderChips?: boolean;
  shrinkLabel?: boolean;
  displayEmpty?: boolean;
}

/**
 * PmxDropdown component renders a customizable dropdown menu.
 *
 * @component
 * @param {PmxDropdownProps} props - The props for the dropdown component.
 * @param {DropdownOption[]} props.options - The options to display in the dropdown.
 * @param {string | string[]} props.value - The selected value(s).
 * @param {string} props.label - The label for the dropdown.
 * @param {boolean} [props.loading=false] - Whether the dropdown is in a loading state.
 * @param {boolean} [props.renderChips=false] - Render dropdown values as chips
 * @param {boolean} [props.multiple=false] - Whether the dropdown allows multiple selections.
 * @param {function(string | string[]): void} props.onChange - Callback function for dropdown state management.
 * @param {CSSProperties} [props.dropdownSx] - Optional custom styles for the dropdown.
 * @param {CSSProperties} [props.containerSx] - Optional custom styles for the container.
 * @param {boolean} [props.error=false] - Whether the dropdown has an error.
 * @param {string} [props.helperText=''] - Helper text displayed below the dropdown.
 * @param {boolean} [shrinkLabel=false] - Whether the dropdown label is shrunken.
 * @returns {React.JSX.Element} The rendered dropdown component.
 */
const PmxDropdown = ({
  options,
  value,
  label,
  loading = false,
  dropdownSx,
  containerSx,
  multiple = false,
  onChange,
  error = false,
  helperText = '',
  disabled = false,
  renderChips = false,
  shrinkLabel = false,
  displayEmpty = false,
}: PmxDropdownProps) => {
  const idSlug = slugify(label);

  // State for tracking the currently open nested menu and its anchor
  const [nestedOpen, setNestedOpen] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const nestedMenuRef = useRef<HTMLElement | null>(null);

  /**
   * Handles value change events for the dropdown.
   * Differentiates between single and multiple selections.
   * @param {SelectChangeEvent<string | string[]>} event - The change event from the Select component.
   */
  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    if (!options) return;

    const selectedValues = Array.isArray(event.target.value) ? event.target.value : [event.target.value];
    let newSelection: string[] = selectedValues.filter(
      (val) => !options.some((opt) => typeof opt === 'object' && opt.value === val),
    ); // Remove parent from selection

    selectedValues.forEach((value) => {
      const option = options.find((opt) => typeof opt === 'object' && opt.value === value);

      if (typeof option === 'object' && option?.children) {
        const childValues = option.children.map((child) => typeof child === 'object' && child.value);
        // @ts-expect-error
        const allChildrenSelected = childValues.every((child) => newSelection.includes(child));

        if (allChildrenSelected) {
          // Parent clicked when all children are selected → REMOVE all children
          newSelection = newSelection.filter((val) => !childValues.includes(val));
        } else {
          // Parent clicked → ADD all children
          newSelection = [...newSelection, ...childValues] as string[];
        }
      } else {
        newSelection = selectedValues;
      }
    });
    multiple ? onChange(newSelection) : onChange(event.target.value);
  };

  /**
   * Opens the nested submenu when hovering over a parent menu item.
   */
  const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>, option: DropdownOption) => {
    if (typeof option !== 'string' && option.children) {
      setAnchorEl(event.currentTarget);
      setNestedOpen(option.value);
    }
  };

  /**
   * Closes the submenu when moving away from the nested menu.
   */
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (nestedMenuRef.current && nestedMenuRef.current.contains(event?.relatedTarget as Node)) {
      return;
    }
    setNestedOpen(null);
    setAnchorEl(null);
  };

  /**
   * Removes selected value for chips rendering (when multiple selections enabled).
   */
  const removeSelectedValue = (selectedValues: string[], valueToRemove: string) => {
    return selectedValues.filter((v) => v !== valueToRemove);
  };

  /**
   * Renders individual dropdown items, detecting parent-child relationships.
   */
  const renderMenuItem = (option: DropdownOption) => {
    if (typeof option === 'string') {
      return (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      );
    }

    return (
      <MenuItem key={option.value} value={option.value} onMouseEnter={(event) => handleMouseEnter(event, option)}>
        {option.label}
        {option.children && <ArrowRightIcon fontSize="small" />}
      </MenuItem>
    );
  };

  const selectedOption = options.find((opt) => typeof opt !== 'string' && opt.value === nestedOpen);

  return (
    <>
      <FormControl
        fullWidth
        error={error}
        aria-describedby={idSlug + '-helper-text'}
        {...(containerSx && { sx: containerSx })}
      >
        <InputLabel id={idSlug} {...(shrinkLabel && { shrink: shrinkLabel })}>
          {displayEmpty ? undefined : label}
        </InputLabel>

        {/* Primary dropdown */}
        <Select
          labelId={idSlug}
          value={value}
          label={displayEmpty ? undefined : label}
          aria-label={label}
          multiple={multiple}
          onChange={handleChange}
          disabled={loading || !options.length || disabled}
          displayEmpty
          endAdornment={
            loading ? (
              <InputAdornment position="end">
                <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
              </InputAdornment>
            ) : null
          }
          {...(dropdownSx && { sx: dropdownSx })}
          {...(renderChips && {
            renderValue: (selected: string | string[]) =>
              Array.isArray(selected) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selected.slice(0, 3).map((val) =>
                    options.length > 0 && typeof options[0] === 'string' ? (
                      <Chip
                        key={val}
                        label={val}
                        onDelete={(e) => {
                          e.stopPropagation();
                          const updatedValues = removeSelectedValue(selected, val);
                          onChange(updatedValues);
                        }}
                        sx={{ borderRadius: '8px', padding: '8px' }}
                        onMouseDown={(e) => e.stopPropagation()}
                        deleteIcon={<CloseIcon />}
                      />
                    ) : (
                      <Chip
                        key={val}
                        // @ts-ignore This will work when there options is not a list of strings
                        label={options.find((option) => option.value === val).label ?? val}
                        onDelete={(e) => {
                          e.stopPropagation();
                          const updatedValues = removeSelectedValue(selected, val);
                          onChange(updatedValues);
                        }}
                        sx={{ borderRadius: '8px', padding: '8px' }}
                        onMouseDown={(e) => e.stopPropagation()}
                        deleteIcon={<CloseIcon />}
                      />
                    ),
                  )}
                  {selected.length > 3 && (
                    <Chip label={`+${selected.length - 3}`} sx={{ borderRadius: '8px', padding: '8px' }} />
                  )}
                </Box>
              ) : (
                <Chip label={selected} />
              ),
          })}
        >
          {options.length > 0 ? options.map(renderMenuItem) : <MenuItem disabled>No options available</MenuItem>}
        </Select>
        {helperText && <FormHelperText id={idSlug + '-helper-text'}>{helperText}</FormHelperText>}
      </FormControl>

      {/* Popper should be rendered OUTSIDE the dropdown */}
      <Popper
        open={nestedOpen !== null}
        anchorEl={anchorEl}
        placement="left-start"
        disablePortal
        onMouseLeave={handleMouseLeave}
      >
        <Paper elevation={3} sx={{ pointerEvents: 'auto', maxHeight: 400, overflowY: 'auto' }}>
          <MenuList>
            {selectedOption &&
              typeof selectedOption === 'object' &&
              'children' in selectedOption &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              selectedOption?.children?.map((child: any) => (
                <MenuItem
                  key={child.value}
                  value={child.value}
                  onClick={() => Array.isArray(value) && onChange([...value, child.value])}
                  selected={value?.includes(child.value)}
                >
                  {child.label}
                </MenuItem>
              ))}
          </MenuList>
        </Paper>
      </Popper>
    </>
  );
};

export default PmxDropdown;
