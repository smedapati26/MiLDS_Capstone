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

import { ITasks } from '@features/task-explorer';
import { useDeleteTaskMutation } from '@store/amap_ai/tasks/slices/tasksApi';

const DeleteTaskDialog = ({ task, open, handleClose }: { task: ITasks; open: boolean; handleClose: () => void }) => {
  const { showAlert } = useSnackbar();
  const [deleteTask, { isLoading: deleteLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      await deleteTask({ task_number: task.taskNumber })
        .unwrap()
        .then()
        .finally(() => {
          showAlert('Task deleted', 'success', false);
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
          Are you sure you want to permanently delete the task <strong>{task.taskTitle}</strong>? This task will be
          deleted from UCTL and the system.
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

export default DeleteTaskDialog;
