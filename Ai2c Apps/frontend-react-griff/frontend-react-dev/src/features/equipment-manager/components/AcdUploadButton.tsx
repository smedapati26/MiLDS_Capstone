import React, { useEffect, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PendingIcon from '@mui/icons-material/Pending';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import AcdHistory from '@features/equipment-manager/components/AcdHistory';
import AcdUpload from '@features/equipment-manager/components/AcdUpload';

import {
  useCancelAcdUploadMutation,
  useGetAcdUploadLatestHistoryQuery,
  useUploadAcdMutation,
} from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import AcdPending from './AcdPending';

/**
 * Acd upload button that controls the modals
 * @returns React.ReactNode
 */
const AcdUploadButton: React.FC = (): React.ReactNode => {
  const currentUic = useAppSelector(selectCurrentUic);
  const [open, setOpen] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showPending, setShowPending] = useState<boolean>(false);
  const [uploadId, setUploadId] = useState<string | number | undefined>(undefined);
  const { data: latestHistoryData, isLoading: latestIsLoading } = useGetAcdUploadLatestHistoryQuery({
    uic: currentUic,
  });
  const [uploadAcd, { isLoading: uploadLoading }] = useUploadAcdMutation();
  const [cancelUpload, { isLoading: cancelLoading }] = useCancelAcdUploadMutation();

  useEffect(() => {
    setShowPending(
      latestHistoryData?.status === 'Pending' ||
        latestHistoryData?.status === 'Transmitting' ||
        latestHistoryData?.status === 'Processing',
    );
    setUploadId(latestHistoryData?.id);
  }, [latestHistoryData, setShowPending]);

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleUpload = async () => {
    try {
      const result = await uploadAcd({
        uic: currentUic,
        acdFile: uploadedFile as File,
      }).unwrap();
      setUploadId(result.export_id);

      setShowPending(true);
    } catch (err) {
      console.error('Upload failed:', err);
    }

    handleClose();
  };

  const handleHistory = (): void => {
    setShowHistory((prev) => !prev);
  };

  const handleCancelUpload = async () => {
    try {
      const result = await cancelUpload({ id: uploadId }).unwrap();
      console.log('cancel result:', result);

      setShowPending(false);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
    handleClose();
  };

  if (latestIsLoading) return <Skeleton data-testid={'loading-acd-history'} variant="rectangular" />;

  if (!currentUic) return <></>;

  return (
    <Box>
      <Button
        onClick={!latestIsLoading && handleOpen}
        data-testid="acd-export-upload"
        variant="outlined"
        sx={{
          '& .MuiSvgIcon-root': {
            color: 'currentColor !important',
            fill: 'currentColor !important',
          },
        }}
        startIcon={showPending ? <PendingIcon /> : <FileUploadIcon />}
      >
        {showPending ? 'Pending...' : 'ACD Upload'}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: '700px',
          },
        }}
      >
        <DialogTitle sx={{ pt: '20px', pb: 3, pr: 4, pl: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignContent="center" alignItems="center">
            <Typography variant="body2">Upload ACD</Typography>
            <IconButton size="large" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pl: 4, pr: 4, pb: 0 }}>
          {(() => {
            if (showHistory) {
              return <AcdHistory />;
            } else if (showPending) {
              return <AcdPending isTransmitting={latestHistoryData?.status === 'Transmitting'} />;
            } else {
              return <AcdUpload uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />;
            }
          })()}
        </DialogContent>
        <DialogActions
          sx={{ pt: 3, pb: '20px', pr: 4, pl: 4, display: 'flex', justifyContent: 'space-between', width: '100%' }}
        >
          <Button
            onClick={handleHistory}
            data-testid="acd-history"
            startIcon={showHistory ? <ArrowBackIcon /> : <ArrowForwardIcon />}
            sx={{
              textTransform: 'none',
              padding: 0,
              minWidth: 'auto',
              color: 'primary.main',
              fontSize: '1rem',
              fontWeight: 'normal',
              borderBottom: '1px solid currentColor',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                borderBottom: '1px solid currentColor',
              },
              '& .MuiButton-startIcon': {
                marginRight: '4px',
                marginLeft: 0,
              },
            }}
          >
            {showHistory ? 'Back to ACD upload' : 'View unit ACD upload history'}
          </Button>
          {(() => {
            if (showHistory) {
              return (
                <Button variant="contained" size="small" onClick={handleClose}>
                  Close
                </Button>
              );
            } else if (showPending) {
              return (
                <Stack direction="row" spacing={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancelUpload}
                    color="error"
                    disabled={latestHistoryData?.status === 'Transmitting'}
                    startIcon={cancelLoading && <CircularProgress size={4} color="inherit" />}
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Upload'}
                  </Button>
                  <Button variant="contained" size="small" onClick={handleClose}>
                    Close
                  </Button>
                </Stack>
              );
            } else {
              return (
                <Stack direction="row" spacing={3}>
                  <Button variant="outlined" size="small" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleUpload}
                    disabled={!uploadedFile || uploadLoading}
                    startIcon={uploadLoading && <CircularProgress size={4} color="inherit" />}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload'}
                  </Button>
                </Stack>
              );
            }
          })()}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcdUploadButton;
