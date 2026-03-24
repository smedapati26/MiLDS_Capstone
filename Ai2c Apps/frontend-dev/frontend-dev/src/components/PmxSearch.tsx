import React, { useState } from 'react';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  TextFieldProps,
  Typography,
  useTheme,
} from '@mui/material';

/**
 * Represents a single recent search entry.
 */
export interface RecentSearch {
  /** The search text entered by the user. */
  text: string;

  /** Timestamp of when the search was added. */
  addedAt: number;
}

/**
 * Props for the PmxSearch component.
 */
export interface PmxSearchProps extends Omit<TextFieldProps, 'onChange'> {
  /** Placeholder text displayed inside the search field. Defaults to "Search...". */
  placeholder?: string;

  /** The current value of the search input field. */
  value: string;

  /** Callback function triggered when the input value changes. */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /** Optional array of recent searches to display when the input is focused. */
  recentSearches?: RecentSearch[];

  /** Callback triggered when a recent search item is clicked. */
  onRecentSearchClick?: (text: string) => void;

  /** Callback triggered when a recent search item is removed. */
  onRemoveRecent?: (text: string) => void;
  onClearAllRecent?: () => void;
}

/**
 * A styled search input component with a search icon and optional recent search dropdown.
 *
 * @param {string} placeholder - Placeholder text for the input field.
 * @param {string} value - Current value of the search input.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Callback for handling input changes.
 * @param {RecentSearch[]} recentSearches - Optional list of recent searches to display.
 * @param {(text: string) => void} onRecentSearchClick - Callback when a recent search is selected.
 * @param {TextFieldProps} rest - Additional props for the Material-UI TextField component.
 * @returns {React.JSX.Element} The rendered search input component.
 */
const PmxSearch = ({
  placeholder = 'Search...',
  value,
  onChange,
  recentSearches = [],
  onRecentSearchClick,
  onRemoveRecent,
  ...rest
}: PmxSearchProps): React.JSX.Element => {
  const theme = useTheme();
  const background16 = theme.palette.layout?.background16 || '#f0f0f0';
  const [focused, setFocused] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setFocused(false)}>
      <Box sx={{ position: 'relative', ...rest.sx }}>
        <TextField
          {...rest}
          sx={{
            borderRadius: '10px',
            border: `1px solid ${background16}`,
            '& .MuiInputBase-root': {
              borderRadius: '10px',
              padding: '6px',
            },
            '& .MuiInputBase-input': {
              padding: '0 0 6px 0',
            },
            '& .MuiFilledInput-root::before, & .MuiFilledInput-root::after': {
              borderBottom: 'none',
            },
            '& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: 'none',
            },
            '& .MuiInputAdornment-root.MuiInputAdornment-positionStart': {
              marginTop: '0px !important',
            },
          }}
          variant="filled"
          placeholder={placeholder}
          value={value}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={onChange}
          onFocus={() => setFocused(true)}
        />

        {focused && recentSearches.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              mt: 1,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            <Typography variant="subtitle2" mb={3} mt={3} ml={3}>
              Recent Search
            </Typography>

            <List dense disablePadding>
              {recentSearches.slice(0, 10).map((r) => (
                <ListItemButton key={`${r.text}-${r.addedAt}`} onClick={() => onRecentSearchClick?.(r.text)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HistoryRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={r.text} />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecent?.(r.text);
                    }}
                    aria-label="Remove recent"
                  >
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default PmxSearch;
