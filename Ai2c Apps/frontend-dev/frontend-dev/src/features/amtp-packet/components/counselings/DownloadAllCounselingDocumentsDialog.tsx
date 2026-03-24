import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { useDispatch } from 'react-redux';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import PmxFilePreview from '@components/PmxFilePreview';
import { getCounselingDocument } from '@store/amap_ai/counselings';
import { IDA4856 } from '@store/amap_ai/counselings/models';
import { useAppSelector } from '@store/hooks';

/* Props for the DownloadAllCounselingDocumentsDialog component. */
export interface DownloadAllCounselingDocumentsDialogProps {
  counselings: IDA4856[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A functional component that acts as the UI and related forms for the Edit Counseling Dialog.
 *
 * @component
 * @param { IDA4856[] } counselings - The document being edited.
 * @param { boolean } open - The state variable for if this dialog is open.
 * @param { React.Dispatch<React.SetStateAction<boolean>> } setOpen - The setState function for the open state for this dialog.
 * @returns {React.JSX.Element} The rendered component.
 */
const DownloadAllCounselingDocumentsDialog: React.FC<DownloadAllCounselingDocumentsDialogProps> = ({
  counselings,
  open,
  setOpen,
}) => {
  const dispatch = useDispatch();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchAllFiles = async () => {
      const retrievedFiles: File[] = [];

      for (const counseling of counselings) {
        if (counseling.document) {
          const { data: currentFile } = await dispatch(
            // @ts-expect-error - The returned type of the dispatch is not directly assignable to File, but this works as intended.
            getCounselingDocument.initiate({
              soldier_id: maintainer?.id ?? '1234567890',
              da_4856_id: counseling.id.toString(),
            }),
          );

          retrievedFiles.push(currentFile as File);
        }
      }

      setFiles(retrievedFiles);
      setSelectedFiles(retrievedFiles);
    };

    fetchAllFiles();
  }, [counselings, maintainer, dispatch]);

  const handleToggleSelectFile = (file: File) => {
    setSelectedFiles((prev) => {
      const fileExists = prev.some(
        (selectedFile) => selectedFile?.name === file?.name && selectedFile?.size === file?.size,
      );
      return fileExists
        ? prev.filter((selectedFile) => selectedFile?.name !== file?.name && selectedFile?.size !== file?.size)
        : [...prev, file];
    });
  };

  const handleDownload = async () => {
    const fileZip = new JSZip();

    selectedFiles.forEach((file) => {
      fileZip.file(file?.name, file);
    });

    const zipContent = await fileZip.generateAsync({ type: 'blob' });

    const zipUrl = URL.createObjectURL(zipContent);
    const zipLink = document.createElement('a');
    zipLink.href = zipUrl;
    zipLink.download = `${maintainer?.name} Counseling Documents.zip`;
    document.body.appendChild(zipLink);
    zipLink.click();
    document.body.removeChild(zipLink);
    URL.revokeObjectURL(zipUrl);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      onClose={() => setOpen(false)}
      open={open}
      aria-label="Download All Counseling Documents Dialog"
    >
      <DialogTitle>Preview Download Counselings</DialogTitle>
      <DialogContent>
        {files.map((file, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display={'flex'} justifyItems={'center'} alignItems={'center'}>
                <Checkbox
                  onChange={() => handleToggleSelectFile(file)}
                  onClick={(event) => event.stopPropagation()}
                  onFocus={(event) => event.stopPropagation()}
                  checked={selectedFiles.some(
                    (selectedFile) => selectedFile?.name === file?.name && selectedFile?.size === file?.size,
                  )}
                />
                <Typography variant="body2">{file?.name}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {file && <PmxFilePreview fileName={file?.name} filePath={URL.createObjectURL(file)} />}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={() => setOpen(false)} variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" disabled={selectedFiles.length == 0} onClick={() => handleDownload()}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadAllCounselingDocumentsDialog;
