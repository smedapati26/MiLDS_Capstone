import { useState } from 'react';

import { Autocomplete, CircularProgress, FormControl, FormHelperText, TextField } from '@mui/material';

interface PmxAutoCompleteProps {
  options: { label: string; value: string }[];
  value: { label: string; value: string } | { label: string; value: string }[];
  onChange: (values: { label: string; value: string }[]) => void;
  label: string;
  loading?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
}

const PmxAutoComplete = ({
  options,
  value,
  onChange,
  label,
  multiple = false,
  loading = false,
  error = false,
  helperText = '',
  disabled = false,
}: PmxAutoCompleteProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <Autocomplete
        multiple={multiple}
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        filterOptions={(opts, { inputValue }) =>
          opts.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 100)
        }
        disableCloseOnSelect={true}
        value={value}
        onChange={(_, newValues) => {
          if (multiple) {
            onChange(Array.isArray(newValues) ? (newValues as { label: string; value: string }[]) : []);
          } else {
            onChange(newValues ? [newValues as { label: string; value: string }] : []);
          }
        }}
        disabled={disabled}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default PmxAutoComplete;
