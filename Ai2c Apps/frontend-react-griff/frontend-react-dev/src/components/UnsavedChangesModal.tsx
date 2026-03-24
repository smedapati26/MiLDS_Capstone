import { FC } from 'react';

import { Close } from '@mui/icons-material';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';

/* Props for the UnsavedChangesModal component. */
export interface UnsavedChangesModalProps {
  open: boolean;
  handleSave: () => void;
  handleDiscard: () => void;
  handleCancel: () => void;
}

/**
 * A functional component that acts as a prompt to intercept the user navigating off of a page with unsaved changes.
 * Prompts the user to save their changes, discard their changes, or cancel the attempted navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
const UnsavedChangesModal: FC<UnsavedChangesModalProps> = ({ open, handleSave, handleDiscard, handleCancel }) => {
  return (
    <Box aria-label="Unsaved Changes Modal">
      <Modal open={open} onClose={handleCancel}>
        <Box
          sx={{
            position: 'absolute',
            top: '33%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '33%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Leave Without Saving</Typography>
            <IconButton size="large" onClick={handleCancel}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ py: 2 }}>
            <Typography sx={{ py: 1 }}>
              You have unsaved changes on this page. Leaving will discard any changes made.
            </Typography>
            <Typography sx={{ py: 1 }}>Do you want to save your changes?</Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Button variant="outlined" onClick={handleCancel}>
              CANCEL
            </Button>

            <Box sx={{ textAlign: 'right' }}>
              <Button variant="outlined" color="error" sx={{ m: 2 }} onClick={handleDiscard}>
                DISCARD
              </Button>

              <Button variant="contained" onClick={handleSave}>
                SAVE CHANGES
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UnsavedChangesModal;
