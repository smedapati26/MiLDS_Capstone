import useUnitAccess from '@hooks/useUnitAccess';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, IconButton, Tooltip } from '@mui/material';

const ActionBtns = ({
  handleView,
  handleEdit,
  handleDelete,
  hasAttachments = false,
}: {
  hasAttachments?: boolean;
  handleView: () => void;
  handleEdit: () => void;
  handleDelete?: () => void;
}) => {
  const { hasRole } = useUnitAccess();

  return (
    <Box display="flex">
      <Tooltip title="Edit">
        <IconButton color="primary" aria-label="edit" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      {hasAttachments && (
        <Tooltip title="Preview Documents">
          <IconButton aria-label="view" color="primary" onClick={handleView}>
            <FolderOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
      {hasRole('manager') && handleDelete && (
        <Tooltip title="Delete">
          <IconButton color="primary" aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionBtns;
