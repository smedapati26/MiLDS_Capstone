import React, { useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

export type ClearSubordinatesOption = 'fields' | 'all';

type Props = {
  open: boolean;
  handleClose: () => void;
  handleClearAll: () => void;
  handleClearFields: () => void;
};

/**
 * Confirmation Modal for deleting Subordinate Units with children
 */

export const ClearSubordinatesDialog: React.FC<Props> = ({ open, handleClose, handleClearAll, handleClearFields }) => {
  const [clearType, setClearType] = useState<ClearSubordinatesOption>('fields');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setClearType(value as ClearSubordinatesOption);
  };

  const handleClear = () => {
    if (clearType === 'fields') {
      handleClearFields();
    }
    if (clearType === 'all') {
      handleClearAll();
    }
  };

  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Clear Subordinate Group</DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-fields-dialog-description">
            By selecting `Clear Subordinate Fields`, the system will remove all data but maintain the subordinate task
            force structure built.
          </DialogContentText>
          <DialogContentText id="clear-all-dialog-confirmation-text" sx={{ mt: 4 }}>
            By selecting `Clear All`, the system will data and hierarchal structure of the task force and require new
            subordinates to be created.
          </DialogContentText>
          <DialogContentText id="option-dialog-confirmation-text" sx={{ mt: 4 }}>
            What would you like to do?
          </DialogContentText>
          <FormControl>
            <RadioGroup aria-labelledby="option-dialog-confirmation-text" defaultValue="fields" onChange={handleChange}>
              <FormControlLabel value="fields" control={<Radio />} label="Clear Subordinate Fields" />
              <FormControlLabel value="all" control={<Radio />} label="Clear All" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" data-testid="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleClear} variant="contained" data-testid="confirm-delete-btn">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
