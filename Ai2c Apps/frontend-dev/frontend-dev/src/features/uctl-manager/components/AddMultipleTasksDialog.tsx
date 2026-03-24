import { useEffect, useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';

interface TaskOption {
  id: string;
  value: string;
}

interface AddMultipleTasksDialogProps {
  open: boolean;
  onClose: () => void;
  allTasks: TaskOption[];
  selectedTaskIds: string[];
  onUpdateSelected: (updatedIds: string[]) => void;
}

const AddMultipleTasksDialog = ({
  open,
  onClose,
  allTasks,
  selectedTaskIds,
  onUpdateSelected,
}: AddMultipleTasksDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedTaskIds);
    }
  }, [open, selectedTaskIds]);

  const filteredTasks = useMemo(() => {
    return allTasks?.filter((task) => task.value.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allTasks]);

  const handleToggle = (taskId: string) => {
    setLocalSelectedIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  };

  const handleAdd = () => {
    onUpdateSelected(localSelectedIds);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Add Multiple Tasks</Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Tasks:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {localSelectedIds.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tasks selected
              </Typography>
            ) : (
              localSelectedIds.map((id) => {
                const task = allTasks.find((t) => t.id === id);
                return task ? <Chip key={id} label={task.value} /> : null;
              })
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />

        <List sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
          {filteredTasks.map((task) => (
            <ListItem key={task.id} onClick={() => handleToggle(task.id)}>
              <ListItemIcon>
                <Checkbox checked={localSelectedIds.includes(task.id)} />
              </ListItemIcon>
              <ListItemText primary={task.value} />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleAdd} variant="contained" disabled={localSelectedIds.length === 0}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMultipleTasksDialog;
