/**
 * PmxFilePreview Component
 *
 * This component is responsible for rendering a preview of a file.
 * If the file is a PDF, it displays an iframe for previewing.
 * If the file is an image, it displays an img element instead.
 *
 * @component
 * @param {string} fileName - The name of the file.
 * @param {string} filePath - The path where the file is located.
 * @returns {React.JSX.Element} The rendered file preview component.
 */

import { Box, Typography, useTheme } from '@mui/material';

type FilePreviewProps = {
  /** The name of the file to preview */
  fileName: string;
  /** The path of the file to be loaded */
  filePath: string | null;
};

const PmxFilePreview = ({ fileName, filePath }: FilePreviewProps) => {
  const theme = useTheme();

  return (
    <div>
      {filePath &&
        ((fileName.endsWith('.pdf') && (
          <iframe src={filePath} width="100%" height="600px" title={`Preview of ${fileName}`} />
        )) ||
          (!fileName.endsWith('.pdf') && <img src={filePath} alt={fileName} width="100%" /> && (
            <Typography variant="h2">Only PDFs can be previewed</Typography>
          )))}
      {filePath === null && (
        <Box
          width="100%"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '700px',
            borderColor: theme.palette.grey.main,
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        >
          <Typography variant="h2">Preview unavailable</Typography>
        </Box>
      )}
    </div>
  );
};

export default PmxFilePreview;
