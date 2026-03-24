import React, { useState } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';

interface AcdExportUploadProps {
  uic: string; // Define the uic prop
}

const AcdExportUpload: React.FC<AcdExportUploadProps> = ({ uic }) => {
  const [file, setFile] = useState<File | null>(null); // To store the selected file
  const [message, setMessage] = useState<string>(''); // To display success/error messages
  const [isUploading, setIsUploading] = useState<boolean>(false); // To track upload state

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
    setMessage(''); // Clear any previous message
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    setIsUploading(true); // Set loading state

    const formData = new FormData();
    formData.append('acd_export', file); // Add the file to the form data
    formData.append('unit', uic); // Add the UIC to the form data

    try {
      const response = await fetch(`${import.meta.env.VITE_GRIFFIN_BASE_URL}/auto_dsr/acd_upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully!');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while uploading the file.');
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  return (
    <Paper elevation={1} sx={{ padding: 2, maxWidth: 300, margin: 'auto' }}>
      <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
        {/* File Upload and Submit Buttons */}
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          {/* File Upload Button */}
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '0.8rem',
              padding: '4px 8px',
            }}
          >
            {file ? file.name : 'Upload ACD Export'}
            {/* Hidden file input */}
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".csv, .xlsx" // Restrict file types
            />
          </Button>

          {/* Submit Button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleUpload}
            disabled={isUploading}
            sx={{
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.8rem',
              padding: '4px 8px',
            }}
          >
            {isUploading ? 'Uploading...' : 'Submit'}
          </Button>
        </Box>

        {/* Linear Progress Bar */}
        {isUploading && (
          <LinearProgress
            sx={{
              width: '100%',
              height: 4,
              marginTop: 1,
            }}
          />
        )}

        {/* Message */}
        {message && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              marginTop: 1,
            }}
            color={message.includes('Error') ? 'error' : 'success'}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AcdExportUpload;
