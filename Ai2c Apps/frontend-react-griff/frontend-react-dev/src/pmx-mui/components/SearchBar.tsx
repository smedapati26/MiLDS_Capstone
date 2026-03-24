import React from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, Theme, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CSSProperties } from '@mui/material/styles/createMixins';
import TextField from '@mui/material/TextField';

import { EnumOption } from '../models/EnumOption';

const searchBarStyles = (
  theme: Theme,
  isSmall: boolean,
  isUnderline: boolean,

  styles: CSSProperties | undefined,
) => {
  return {
    borderRadius: '10px',
    backgroundColor: isUnderline ? 'transparent' : theme.palette.layout?.background12,
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      '& .MuiOutlinedInput-input': {
        height: isSmall ? '1em' : null,
        '&::placeholder': {
          color: theme.palette.text.primary,
        },
      },
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.text.primary,
      marginLeft: '6px',
    },
    '& .Mui-focused': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.primary.main,
      },
    },
    ...styles,
  };
};

export type searchBarVariants = 'standard' | 'underline';
export type searchBarColor = 'default' | 'secondary';

/**
 * @typedef SearchBarProps
 * @prop { Array<any> } options - AutoComplete options
 * @prop { boolean } [small] - Sets SearchBar height to small
 * @prop { "standard" | "underline" } [variant="standard"] - SearchBar styling options
 * @prop { "default" | "secondary" } [small=false] - Sets SearchBar height to small
 * @prop {CSSProperties} [styles] - Passes styles to MUI sx property
 */
export type SearchBarProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: ReadonlyArray<any>;

  onChange?: (event: React.SyntheticEvent, value: EnumOption) => void;
  placeholder?: string;
  small?: boolean;
  variant?: 'standard' | 'underline';
  color?: 'default' | 'secondary';
  styles?: CSSProperties | undefined;
};

/**
 * Search Bar
 *
 * MUI AutoComplete wrapper function to apply custom styles
 *
 * @param { SearchBarProps } props
 */
export const SearchBar: React.FC<SearchBarProps> = (props) => {
  const { options, onChange, placeholder = 'Search...', small = false, variant = 'standard', styles, ...other } = props;

  const theme = useTheme();
  const isUnderline = variant === 'underline';

  return (
    <Autocomplete
      aria-label="search-bar"
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      size="small"
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          variant={isUnderline ? 'standard' : 'outlined'}
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon data-testid="searchIcon" />
              </InputAdornment>
            ),
          }}
        />
      )}
      {...other}
      sx={searchBarStyles(theme, small, isUnderline, styles)}
    />
  );
};
