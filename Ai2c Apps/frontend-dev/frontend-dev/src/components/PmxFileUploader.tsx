import { ChangeEvent, DragEvent } from 'react';

import ClearIcon from '@mui/icons-material/Clear';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Box, Button, Grid, IconButton, Typography, useTheme } from '@mui/material';

/**
 * FileUploader component allows users to drag and drop a file,
 * or browse their system to upload a file manually.
 *
 * @returns {React.JSX.Element} Rendered component with drag-and-drop area and uploaded file preview
 */
const PmxFileUploader = ({
  attachedFile,
  setAttachedFile,
  forcePDF = true,
}: {
  attachedFile: File | null;
  setAttachedFile: React.Dispatch<React.SetStateAction<File | null>>;
  forcePDF?: boolean;
}): React.JSX.Element => {
  const theme = useTheme();

  /**
   * Handles file drop into the drag-and-drop area.
   *
   * @param {DragEvent<HTMLDivElement>} event - The drop event from the user
   */
  const handleDropFile = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      setAttachedFile(event.dataTransfer.files[0]);
    }
  };

  /**
   * Handles file selection via the file browser input.
   *
   * @param {ChangeEvent<HTMLInputElement>} event - The change event triggered on file input
   */
  const handleChangeAttachedFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAttachedFile(event.target.files[0]);
    }
  };

  /**
   * Clears the currently attached file from state.
   */
  const handleRemoveDocument = () => {
    setAttachedFile(null);
  };

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Box
          onDrop={handleDropFile}
          onDragOver={(event) => event.preventDefault()}
          aria-label="Drag and Drop File Area"
          sx={{
            border: `2px dashed ${theme.palette.primary.main}`,
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <FileUploadIcon sx={{ width: 80, height: 80 }} />
            <Typography variant="h5" py={2}>
              Drag and drop file(s) here
            </Typography>
            <Typography variant="h5" color={theme.palette.text.secondary} pb={2}>
              Or
            </Typography>
            <Button component="label" variant="outlined">
              BROWSE
              {forcePDF && (
                <input type="file" data-testid="file-input" accept=".pdf" hidden onChange={handleChangeAttachedFiles} />
              )}
              {!forcePDF && <input type="file" data-testid="file-input" hidden onChange={handleChangeAttachedFiles} />}
            </Button>
          </Box>
        </Box>
      </Grid>

      {attachedFile && (
        <Grid size={{ xs: 12 }} mt={2}>
          <Box
            sx={{
              backgroundColor: theme.palette.layout?.background11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 1,
              paddingY: 2,
              paddingX: 3,
            }}
          >
            <Box display="flex" alignItems="center">
              <DownloadDoneIcon color="success" sx={{ mr: 2 }} />
              {attachedFile.name}
            </Box>
            <IconButton aria-label="remove-btn" onClick={handleRemoveDocument}>
              <ClearIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
          </Box>
        </Grid>
      )}
    </>
  );
};

export default PmxFileUploader;
