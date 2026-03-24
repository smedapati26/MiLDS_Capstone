import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InfoIcon from '@mui/icons-material/Info';
import { Alert, Button, Card, IconButton, Stack, Typography, useTheme } from '@mui/material';

interface Props {
  uploadedFile: File | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

/**
 * ACD upload page
 * @returns React.ReactNode
 */
const AcdUpload: React.FC<Props> = ({ uploadedFile, setUploadedFile }: Props): React.ReactNode => {
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [showUndo, setShowUndo] = useState<boolean>(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleFileUpload = useCallback(
    (file: File) => {
      if (uploadedFile) {
        setPreviousFile(uploadedFile);
        setShowUndo(true);
        // Hide undo after 5 seconds
        // setTimeout(() => setShowUndo(false), 5000);
      }
      setUploadedFile(file);
    },
    [setUploadedFile, uploadedFile],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    [handleFileUpload],
  );

  const handleUndo = () => {
    setUploadedFile(previousFile);
    setPreviousFile(null);
    setShowUndo(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviousFile(null);
    setShowUndo(false);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDrop: onDrop,
  });

  const handleBrowseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    open();
  };

  return (
    <Stack spacing="20px">
      <Typography variant="body1">Select ACD files to upload.</Typography>

      <Card elevation={0} sx={{ ...theme.applyStyles('dark', { backgroundColor: theme.palette.layout?.background5 }) }}>
        <Stack
          spacing={3}
          alignItems="center"
          {...getRootProps()}
          sx={{
            border: '1px dashed',
            borderRadius: 2,
            p: '20px 40px',
            textAlign: 'center',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            transition: 'all 0.3s',
          }}
        >
          <input {...getInputProps()} />
          <FileUploadIcon sx={{ fontSize: 80 }} />
          <Typography variant="h5">Drag and drop file here</Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
            or
          </Typography>
          <Button variant="outlined" sx={{ width: '100%' }} size="large" onClick={handleBrowseClick}>
            browse
          </Button>
        </Stack>
      </Card>
      {/* Undo Alert */}
      {showUndo && (
        <Alert
          severity="success"
          icon={<InfoIcon sx={{ color: `${theme.palette.success.l20} !important` }} />} // TODO: fix color
          sx={{
            margin: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            ...(isDark
              ? {
                  backgroundColor: theme.palette.success.d60,
                  border: `1px solid ${theme.palette.success.l20}`,
                  color: theme.palette.text.primary,
                }
              : {
                  backgroundColor: theme.palette.success.l80,
                  border: `1px solid ${theme.palette.success.l20}`,
                  color: theme.palette.text.primary,
                }),
          }}
          action={
            <Button size="small" onClick={handleUndo} sx={{ textDecoration: 'underline' }}>
              Undo
            </Button>
          }
        >
          <Typography variant="body1">Document replaced.</Typography>
        </Alert>
      )}
      {uploadedFile && (
        <Card
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            ...theme.applyStyles('dark', { backgroundColor: theme.palette.layout?.background11 }),
          }}
        >
          <Typography
            variant="body1"
            color="primary"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {uploadedFile.name}
          </Typography>
          <IconButton size="small" onClick={handleRemoveFile}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Card>
      )}
    </Stack>
  );
};

export default AcdUpload;
