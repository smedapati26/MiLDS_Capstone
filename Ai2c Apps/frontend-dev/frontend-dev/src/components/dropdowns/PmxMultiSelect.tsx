import * as React from 'react';

import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  Chip,
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
} from '@mui/material';

type Option = string | { label: string; value: string };

interface PmxMultiSelectProps {
  options: Option[];
  disabled?: boolean;
  values: string[];
  label: string;
  loading?: boolean;
  showSearch?: boolean;
  onChange: (values: string[]) => void;
}

/**
 * PmxMultiSelect component renders a Multi Select Dropdown with search bar.
 *
 * @component
 * @param {PmxMultiSelectProps} props - The properties interface.
 * @param {string} props.label - Label for select dropdown
 * @param {T[]} props.values - Generic array of values to track selection options in the state
 * @param {boolean} props.loading - Flag to indicate if the dropdown is loading.
 * @param {boolean} props.showSearch - Flag to indicate if the dropdown search displays.
 * @param {function(T[]: void)} props.onChange - Callback function for dropdown state management
 *
 * @returns {ReactNode} The rendered multi select dropdown component.
 */

const PmxMultiSelect: React.FC<PmxMultiSelectProps> = ({
  options,
  values,
  label,
  loading = false,
  showSearch = true,
  disabled = false,
  onChange,
}) => {
  const normalized = React.useMemo(
    () => options.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt)),
    [options],
  );

  const [selectAll, setSelectAll] = React.useState<boolean>(false);
  const [query, setSearchQuery] = React.useState<string>('');
  const [dropdownOptions, setDropDownOptions] = React.useState(normalized);
  const [open, setOpen] = React.useState<boolean>(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

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
          onChange(normalized.map((o) => o.value));
        }
        setSelectAll(!selectAll);
      } else {
        onChange(valArray);
      }
    },
    [selectAll, onChange, normalized],
  );

  React.useEffect(() => {
    if (query.length > 0) {
      setDropDownOptions(normalized.filter((x) => x.label.toLowerCase().includes(query.toLowerCase())));
    } else {
      setDropDownOptions(normalized);
    }
  }, [query, normalized]);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    const newValue = event.target.checked ? [...values, value] : values.filter((v) => v !== value);
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onChange([]);
    } else {
      onChange(normalized.map((o) => o.value));
    }
    setSelectAll(!selectAll);
  };

  return (
    <FormControl size="small" sx={{ width: '100%' }} ref={anchorRef}>
      <InputLabel id="multiple-checkbox-label" aria-label={label} sx={{ pt: 2 }}>
        {label}
      </InputLabel>

      <Select
        labelId="multiple-checkbox-label"
        id="multiple-checkbox"
        multiple
        value={values}
        onChange={handleChange}
        disabled={disabled}
        renderValue={(selected) => {
          const selectedLabels = selected.map((val) => normalized.find((o) => o.value === val)?.label || val);

          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedLabels.slice(0, 3).map((label) => (
                <Chip
                  key={label}
                  label={label.length > 15 ? `${label.slice(0, 15)}...` : label}
                  sx={{ borderRadius: '8px', padding: '8px' }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ))}
              {selectedLabels.length > 3 && (
                <Chip label={`+${selectedLabels.length - 3}`} sx={{ borderRadius: '8px', padding: '8px' }} />
              )}
            </Box>
          );
        }}
        open={false}
        onClick={handleClick}
        sx={{ p: 2 }}
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
        sx={{ zIndex: 3 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <Box p={2}>
                  {showSearch && (
                    <TextField
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 12,
                          paddingTop: 2,
                          pl: 1,
                        },
                        '& .MuiInputBase-input': {
                          paddingTop: 0,
                          paddingRight: 0,
                          paddingBottom: 2,
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
                      }}
                      placeholder="Search..."
                      variant="filled"
                      value={query}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon style={{ marginLeft: '8px', marginTop: '10px', marginBottom: '18px' }} />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  )}

                  <MenuItem onClick={handleSelectAll} sx={{ mt: 3 }}>
                    <Checkbox checked={selectAll} />
                    Select All
                  </MenuItem>

                  <Divider />

                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {dropdownOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={values.includes(opt.value)}
                          onChange={(event) => handleCheckboxChange(event, opt.value)}
                        />
                        <ListItemText primary={opt.label} />
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
};

export default PmxMultiSelect;
