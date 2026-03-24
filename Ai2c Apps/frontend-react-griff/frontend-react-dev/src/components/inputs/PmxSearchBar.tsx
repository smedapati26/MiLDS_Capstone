import React, { useEffect, useState } from 'react';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, SxProps, TextField } from '@mui/material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps;
}

/**
 * SearchBar component with optional debouncing
 * @param value - Current search value
 * @param onChange - Callback when search value changes
 * @param placeholder - Placeholder text
 * @param debounceMs - Debounce delay in milliseconds (optional)
 * @param fullWidth - Make the search bar full width
 * @param size - Size of the input field
 * @param sx - the styling of the search bar
 *
 * @return JSX.Element
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 0,
  fullWidth = false,
  size = 'small',
  sx,
}): JSX.Element => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce logic
  useEffect(() => {
    if (debounceMs > 0) {
      const handler = setTimeout(() => {
        onChange(internalValue);
      }, debounceMs);

      return () => {
        clearTimeout(handler);
      };
    } else {
      onChange(internalValue);
    }
  }, [internalValue, debounceMs, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);

    // If no debounce, call onChange immediately
    if (debounceMs === 0) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <TextField
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'action.active' }} />
          </InputAdornment>
        ),
        endAdornment: internalValue && (
          <InputAdornment position="end">
            <IconButton aria-label="clear search" onClick={handleClear} edge="end" size="small">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: '300px',
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        },
        borderRadius: '24px',
        '& fieldset': {
          borderRadius: '24px',
        },
        ...sx,
      }}
    />
  );
};

export default SearchBar;
