import { useRef, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  ListItemText,
  MenuItem,
  Paper,
  Popper,
  TextField,
  Typography,
} from '@mui/material';

interface Option {
  id: string;
  value: string;
}

interface ExtraAction {
  label: string;
  onClick: () => void;
  startAdornment?: React.ReactNode;
}

interface PmxSearchSplitButtonProps {
  buttonTitle: string;
  options: Option[];
  onSelect: (option: Option) => void;
  extraAction?: ExtraAction;
}

const PmxSearchSplitButton = ({ buttonTitle, options, onSelect, extraAction }: PmxSearchSplitButtonProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const handleSelect = (option: Option) => {
    setSelectedId(option.id);
    onSelect(option);
    handleClose();
  };

  const filteredOptions = options.filter((opt) => opt.value.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Button variant="contained" endIcon={<ArrowDropDownIcon />} onClick={handleToggle} ref={anchorRef}>
        {buttonTitle}
      </Button>

      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" style={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper sx={{ width: 400, maxHeight: 400, overflowY: 'auto', mt: 1 }}>
            <Box sx={{ px: 2, py: 1 }}>
              <TextField
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>

            <Divider sx={{ mt: 2, mb: 2 }} />

            {extraAction && (
              <MenuItem
                onClick={() => {
                  extraAction.onClick();
                  handleClose();
                }}
              >
                {extraAction.startAdornment && <Box sx={{ mr: 1 }}>{extraAction.startAdornment}</Box>}
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.dark' },
                  }}
                  component="span"
                >
                  {extraAction.label}
                </Typography>
              </MenuItem>
            )}

            {filteredOptions.length === 0 ? (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No matching tasks
                </Typography>
              </Box>
            ) : (
              filteredOptions.map((option) => (
                <MenuItem key={option.id} selected={option.id === selectedId} onClick={() => handleSelect(option)}>
                  <ListItemText primary={option.value} />
                </MenuItem>
              ))
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default PmxSearchSplitButton;
