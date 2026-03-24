import { useSnackbar } from '@context/SnackbarProvider';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { IUCTLTasks } from '@features/task-explorer';
import { useDeleteUCTLMutation } from '@store/amap_ai/tasks/slices/tasksApi';

const DeleteUCTLDialog = ({
  uctl,
  open,
  handleClose,
}: {
  uctl: IUCTLTasks;
  open: boolean;
  handleClose: () => void;
}) => {
  const { showAlert } = useSnackbar();
  const [deleteUCTL, { isLoading: deleteLoading }] = useDeleteUCTLMutation();

  const handleDelete = async () => {
    try {
      await deleteUCTL({ ictl_id: uctl.ictlId })
        .unwrap()
        .then()
        .finally(() => {
          showAlert('UCTL deleted', 'success', false);
          handleClose();
        });
    } catch (error) {
      console.error('Task deletion failed:', error);
    }
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to permanently delete <strong>{uctl.ictlTitle}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={deleteLoading}
          startIcon={
            deleteLoading ? (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            ) : null
          }
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUCTLDialog;
