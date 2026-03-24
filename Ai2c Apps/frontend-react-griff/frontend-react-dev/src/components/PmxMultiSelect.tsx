import React, { forwardRef, ReactNode, useId, useImperativeHandle } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  Divider,
  FormControl,
  Grow,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  TextField,
  useTheme,
} from '@mui/material';
import { CSSProperties } from '@mui/material/styles/createMixins';

import { slugify } from '@ai2c/pmx-mui';
export interface IOptionWithIds {
  id: string;
  value: string;
}

interface PmxMultiSelectProps {
  options: string[];
  optionWithIds?: IOptionWithIds[] | null;
  values: string[];
  label: string;
  loading?: boolean;
  onChange: (values: string[]) => void;
  maxSelections?: number;
  'data-testid'?: string;
  'aria-label'?: string;
  disabled?: boolean;
  dropdownSx?: CSSProperties;
  containerSx?: CSSProperties;
  textFieldSx?: CSSProperties;
}

/**
 * PmxMultiSelect component renders a Single and Multi Select Dropdown with search bar.
 *
 * @component
 * @param {PmxMultiSelectProps} props - The properties interface.
 * @param {string} props.label - Label for select dropdown
 * @param {T[]} props.values - Generic array of values to track selection options in the state
 * @param {boolean} props.loading - Flag to indicate if the dropdown is loading.
 * @param {boolean} props.disabled - Flag to indicate whether the use can edit that field
 * @param {function(T[]: void)} props.onChange - Callback function for dropdown state management
 * @param {boolean} props.disabled - Flag to disable the dropdown
 * @param {string} 'data-testid' - prop to give the select a test id
 * @param {string} 'aria-label' - prop to give the select an aria label id
 * @param {number} props.maxSelections - the number of items a user can select in this drop down.
 * @param {CSSProperties} props.dropdownSx - properties of the dropdown
 * @param {CSSProperties} props.containerSx - properties of the dropdown container
 * @param {CSSProperties} props.textFieldSx - properties of the text field to overwrite
 *
 * @returns {ReactNode} The rendered multi select dropdown component.
 */

const filterArray = (values: string[], selectedValue: string): string[] => {
  return values.filter((v: string) => v !== selectedValue);
};

export type PmxMultiSelectRef = {
  clearSelectAll: () => void;
};

const PmxMultiSelect = forwardRef<PmxMultiSelectRef, PmxMultiSelectProps>(
  (
    {
      options,
      optionWithIds,
      values,
      label,
      loading = false,
      onChange,
      maxSelections,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
      disabled = false,
      dropdownSx,
      textFieldSx,
    },
    ref,
  ): ReactNode => {
    const theme = useTheme();
    const [selectAll, setSelectAll] = React.useState<boolean>(false);
    const [query, setQuery] = React.useState<string>('');
    const [dropdownOptions, setDropdownOptions] = React.useState<string[]>(options);
    const [open, setOpen] = React.useState<boolean>(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const uniqueId = useId();
    const htmlId = `${slugify(label)}-${uniqueId}`;

    useImperativeHandle(ref, () => ({
      clearSelectAll: () => {
        setSelectAll(false);
      },
    }));

    // this function is never used.
    const handleChange = React.useCallback(
      (event: SelectChangeEvent<typeof values>) => {
        const {
          target: { value },
        } = event;
        const valArray = typeof value === 'string' ? value.split(',') : value;

        if (valArray.includes('all')) {
          if (selectAll) {
            onChange([]);
          } else {
            onChange(options);
          }
          setSelectAll(!selectAll);
        } else {
          if (maxSelections && valArray.length > maxSelections) {
            return;
          }
          onChange(valArray);
        }
      },
      [selectAll, onChange, options, maxSelections],
    );

    React.useEffect(() => {
      if (query.length > 0) {
        setDropdownOptions(options.filter((x) => x.toLowerCase().includes(query.toLowerCase())));
      } else {
        setDropdownOptions(options);
      }
    }, [query, options]);

    const handleClick = () => {
      if (disabled) return;

      setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
      if (anchorRef.current?.contains(event.target as HTMLElement)) {
        return;
      }
      setOpen(false);
    };

    // This too is not being called
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, value: string, index: number) => {
      let selectedValue: string = value;

      if (optionWithIds) {
        selectedValue = optionWithIds[index].id;
      }
      const newValue = event.target.checked ? [...values, selectedValue] : values.filter((v) => v !== selectedValue);
      onChange(newValue);
    };

    const handleSelectAll = () => {
      if (selectAll) {
        onChange([]);
      } else {
        onChange(options);
      }
      setSelectAll(!selectAll);
    };

    const getArrayOfOptionFromId = (ids: string[]): string[] => {
      let values: string[] = [];
      if (optionWithIds) {
        values = ids
          .map((id) => optionWithIds.find((optionWithId) => String(optionWithId.id) === id)?.value)
          .filter((v): v is string => v !== undefined);
      }

      return values;
    };

    const isInOptionWithIds = (index: number): boolean => {
      let ans = false;
      if (optionWithIds) {
        ans = values.includes(optionWithIds[index].id);
      }

      return ans;
    };

    return (
      <FormControl size="small" sx={{ minWidth: 240 }} ref={anchorRef} data-testid={dataTestId} disabled={disabled}>
        <InputLabel id={`pmx-multi-select-label-${slugify(label)}`} sx={{ pt: 1 }}>
          {label}
        </InputLabel>
        <Select
          label={label}
          labelId="multiple-checkbox-label"
          aria-label={ariaLabel}
          id={`${htmlId}-multiple-checkbox`}
          multiple
          value={optionWithIds ? getArrayOfOptionFromId(values) : values}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
          open={false}
          onClick={handleClick}
          disabled={disabled}
          style={{ maxWidth: '240px' }}
          sx={{
            height: '56px',
            ...dropdownSx,
          }}
          input={
            <OutlinedInput
              label={label}
              endAdornment={
                loading ? (
                  <InputAdornment position="end">
                    <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                  </InputAdornment>
                ) : null
              }
            />
          }
        >
          <MenuItem />
        </Select>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          disablePortal
          transition
          sx={{ zIndex: 3, ...(theme.palette.mode === 'dark' && { bgcolor: '#2C2C2C' }) }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <Box p={2}>
                    <TextField
                      sx={{
                        width: 240,
                        height: 46,
                        '& .MuiInputBase-root': {
                          borderRadius: '10px',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                        },
                        '& .MuiInputBase-input': {
                          paddingTop: 0,
                          paddingRight: 0,
                          paddingBottom: '6px',
                          paddingLeft: 0,
                        },
                        '& .MuiFilledInput-root::before': {
                          borderBottom: 'none',
                        },
                        '& .MuiFilledInput-root::focus-within': {
                          borderBottom: 'none',
                        },
                        '& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error):before': {
                          borderBottom: 'none',
                        },
                        '& .MuiFilledInput-root::after': {
                          borderBottom: 'none',
                        },
                        '& .MuiInputAdornment-root': { marginTop: '0px !important' },
                        ...textFieldSx,
                      }}
                      id="outlined-controlled"
                      placeholder="Search..."
                      variant="outlined"
                      value={query}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon style={{ marginLeft: '8px', marginRight: '8px' }} />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setQuery(event.target.value);
                      }}
                    />
                    {!maxSelections && (
                      <MenuItem
                        onClick={handleSelectAll}
                        sx={{
                          mt: 3,
                          '&:hover': {
                            backgroundColor:
                              theme.palette.mode === 'dark' ? theme.palette.primary.d60 : theme.palette.primary.l60,
                          },
                        }}
                      >
                        <Checkbox
                          checked={selectAll}
                          {...(values.length > 0 && { indeterminate: dropdownOptions.length !== values.length })}
                        />
                        Select All
                      </MenuItem>
                    )}
                    <Divider />
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflowY: 'auto',
                        transition: 'all 0.3s ease',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#4E4E4E' : '#B4B4B4',
                        },
                      }}
                    >
                      {dropdownOptions.map((opt: string, index: number) => (
                        <MenuItem
                          key={opt}
                          key-index={index}
                          value={opt}
                          sx={{
                            '&:hover': {
                              backgroundColor:
                                theme.palette.mode === 'dark' ? theme.palette.primary.d60 : theme.palette.primary.l60,
                            },
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            let newVals = [];
                            let selectedValue: string = '';

                            if (optionWithIds) {
                              const keyStr = event.currentTarget.getAttribute('key-index');
                              const keyIndex = keyStr !== null ? Number(keyStr) : -1;
                              const optionWithId = optionWithIds[keyIndex];

                              selectedValue = optionWithId.id;
                            } else {
                              selectedValue = opt;
                            }

                            if (!values.includes(selectedValue)) {
                              newVals = [...values, selectedValue];
                            } else {
                              newVals = filterArray(values, selectedValue);
                            }

                            onChange(newVals);

                            // behavior to close dropdown when max number of selections are selected.
                            if (maxSelections && maxSelections <= newVals.length) {
                              setOpen(false);
                            } else {
                              selectedValue = opt;
                            }

                            if (!values.includes(selectedValue)) {
                              newVals = [...values, selectedValue];
                            } else {
                              newVals = filterArray(values, selectedValue);
                            }

                            onChange(newVals);

                            // behavior to close dropdown when max number of selections are selected.
                            if (maxSelections && maxSelections <= newVals.length) {
                              setOpen(false);
                            }
                          }}
                        >
                          <Checkbox
                            checked={optionWithIds ? isInOptionWithIds(index) : values.includes(opt)}
                            onChange={(event) => handleCheckboxChange(event, opt, index)}
                          />
                          <ListItemText primary={opt} />
                        </MenuItem>
                      ))}
                    </Box>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </FormControl>
    );
  },
);

PmxMultiSelect.displayName = 'PmxMultiSelect';

export default PmxMultiSelect;
