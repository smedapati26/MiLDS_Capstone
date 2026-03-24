import { Box, Typography } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';
import PmxFileUploader from '@components/PmxFileUploader';

const XMLFileUpload = ({
  attachedFile,
  setAttachedFile,
}: {
  attachedFile: File | null;
  setAttachedFile: React.Dispatch<React.SetStateAction<File | null>>;
}) => {
  return (
    <Box>
      <Typography>
        Select the soldier&apos;s DA7817 XML file to upload. Ensure the DoD ID is correct and all dates are in
        YYYY/MM/DD format.
      </Typography>
      <PmxAccordion
        heading="How to convert PDF to XML"
        isLoading={false}
        sx={{ '& .MuiAccordionDetails-root': { height: '100%' } }}
      >
        <ol>
          <li>
            <Typography>Open the DA7817 PDF in Adobe Acrobat Reader.</Typography>
          </li>
          <li>
            <Typography>
              If the file is in protected view, select{' '}
              <Typography component="span" fontWeight="bold">
                Enable all features
              </Typography>
              .
            </Typography>
          </li>
          <li>
            <Typography>
              Navigate to{' '}
              <Typography component="span" fontWeight="bold">
                Edit
              </Typography>{' '}
              &gt;{' '}
              <Typography component="span" fontWeight="bold">
                Form Options
              </Typography>{' '}
              &gt;{' '}
              <Typography component="span" fontWeight="bold">
                Export Data
              </Typography>
              .
            </Typography>
          </li>
          <li>
            <Typography>Choose a name for the XML file. Omit any spaces and save.</Typography>
          </li>
          <li>
            <Typography>Upload the file using the file uploader below.</Typography>
          </li>
        </ol>
      </PmxAccordion>
      <PmxFileUploader attachedFile={attachedFile} setAttachedFile={setAttachedFile} />
    </Box>
  );
};

export default XMLFileUpload;
