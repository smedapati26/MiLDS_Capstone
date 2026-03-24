import React, { useState } from 'react';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Avatar, IconButton, Stack, Typography } from '@mui/material';

/**
 * Props for the PmxImageUploader component.
 */
type Props = {
  /** Optional text to display as a label for the uploader. */
  text?: string;
  onUpload?: (file: File) => void;
};

/**
 * PmxImageUploader component allows users to upload an image file and displays a preview.
 * It uses an Avatar component that shows a file upload icon by default, and switches to the uploaded image preview once a file is selected.
 *
 * @param text - Optional label text displayed above the uploader.
 * @returns A React component for image uploading with preview.
 */
export const PmxImageUploader: React.FC<Props> = ({ text, onUpload }) => {
  // State to hold the preview URL of the uploaded image
  const [preview, setPreview] = useState<string | null>(null);
  // State to hold the selected file (currently unused, but kept for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_file, setFile] = useState<File | null>(null);

  /**
   * Handles the file upload event. Reads the selected file and generates a preview URL.
   *
   * @param event - The change event from the file input.
   */
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Create a FileReader to generate a data URL for the image preview
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => setPreview(reader.result as string);

      // External handling of file
      if (onUpload) {
        onUpload(selectedFile);
      }
    }
  };

  return (
    <Stack direction="column" gap={3}>
      {/* Display the optional label text if provided */}
      {text && <Typography variant="body2">{text}</Typography>}

      {/* Hidden file input that accepts only image files */}
      <input accept="image/*" id="logo-upload-input" type="file" style={{ display: 'none' }} onChange={handleUpload} />

      {/* Label that acts as a clickable area for the file input, with accessibility aria-label */}
      <IconButton component="span" sx={{ width: 100, height: 100 }}>
        <label htmlFor="logo-upload-input" aria-label="Logo Upload">
          <Avatar src={preview || undefined} sx={{ width: 100, height: 100, bgcolor: 'grey.700' }}>
            {/* Show upload icon if no preview is available */}
            {!preview && <FileUploadIcon fontSize="large" />}
          </Avatar>
        </label>
      </IconButton>
    </Stack>
  );
};
