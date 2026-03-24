import React from 'react';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type Props = {
  open: boolean;
  handleClose: () => void;
  handleDelete: () => void;
};

/**
 * Confirmation Modal for deleting Subordinate Units with children
 */

export const DeleteParentDialog: React.FC<Props> = ({ open, handleClose, handleDelete }) => {
  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Deleting a Parent Unit</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Deleting this unit will delete all children units under it.
          </DialogContentText>
          <DialogContentText id="confirm-dialog-confirmation-text" sx={{ mt: 4 }}>
            Are you sure you want to delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" data-testid="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" data-testid="confirm-delete-btn">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
