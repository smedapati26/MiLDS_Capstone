/* eslint-disable sonarjs/todo-tag */
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';
import PmxFilePreview from '@components/PmxFilePreview';
import { useLazyGetEventDocumentsByIdQuery } from '@store/amap_ai/events/slices';
import {
  useLazyGetCombinedDocumentsZipQuery,
  useLazyGetDocumentFileByIdQuery,
} from '@store/amap_ai/supporting_documents';

const SupportingDocsDialog = ({
  open,
  handleClose,
  eventId,
}: {
  open: boolean;
  handleClose: () => void;
  eventId: number;
}) => {
  const theme = useTheme();
  const [getEventDocuments, { data: documents, isFetching }] = useLazyGetEventDocumentsByIdQuery();

  const [getDocumentFile] = useLazyGetDocumentFileByIdQuery();
  const [getCombinedZip, { isFetching: isDownloading }] = useLazyGetCombinedDocumentsZipQuery();

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [fileBlobs, setFileBlobs] = useState<Record<number, string>>({});

  useEffect(() => {
    getEventDocuments({ event_id: eventId });
  }, [eventId, getEventDocuments]);

  const handleSelection = (fileName: string, checked: boolean) => {
    setSelectedFiles((prev) => (checked ? [...prev, fileName] : prev.filter((item) => item !== fileName)));
  };

  const handleDownload = async (documentIds: number[]) => {
    try {
      if (!documentIds.length) return;

      const response = await getCombinedZip({ supporting_doc_ids: documentIds }).unwrap();

      if (response) {
        const url = URL.createObjectURL(response);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = response.name;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download combined documents:', error);
    }
  };

  const handleExpanded = async (docId: number) => {
    setExpandedId((prev) => (prev === docId ? null : docId));

    if (!fileBlobs[docId]) {
      try {
        const response = await getDocumentFile({ document_id: String(docId) });
        const file = response.data as File;
        const documentTitle = documents?.filter((x) => x.id === docId)[0];
        const renamedFile = new File([file], documentTitle + '.pdf', {
          type: file.type,
        });
        const objectUrl = URL.createObjectURL(renamedFile);

        setFileBlobs((prev) => ({ ...prev, [docId]: objectUrl }));
      } catch (error) {
        console.error('Failed to load document file:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Preview and Download Supporting Documents</DialogTitle>
      <DialogContent>
        <Button
          sx={{ textTransform: 'uppercase', mb: 4 }}
          variant="contained"
          onClick={() => documents && handleDownload(documents.map((x) => x.id))}
          disabled={!documents || documents?.length === 0}
          startIcon={
            isDownloading && (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            )
          }
        >
          Download All
        </Button>

        {documents?.map((doc) => (
          <PmxAccordion
            key={doc.id}
            isLoading={isFetching}
            heading={doc.title}
            isSelectable
            selectedItems={selectedFiles}
            handleSelection={handleSelection}
            expanded={expandedId === doc.id}
            handleExpanded={() => handleExpanded(doc.id)}
          >
            {fileBlobs[doc.id] ? (
              <PmxFilePreview fileName={`${doc.title}.pdf`} filePath={fileBlobs[doc.id]} />
            ) : (
              <CircularProgress />
            )}
          </PmxAccordion>
        ))}
        {documents?.length === 0 && (
          <Box
            width="100%"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '700px',
              borderColor: theme.palette.grey.main,
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <Typography variant="h2">No Documents Found</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'uppercase' }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const selectedIds =
              documents?.filter((doc) => selectedFiles.includes(doc.title)).map((doc) => doc.id) ?? [];

            if (!selectedIds.length) return;
            handleDownload(selectedIds);
          }}
          disabled={selectedFiles.length === 0}
          variant="outlined"
          sx={{ textTransform: 'uppercase' }}
          startIcon={
            isDownloading && (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            )
          }
        >
          Download Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupportingDocsDialog;
