import React, { useState } from 'react';

import { ArrowForward } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Modal,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { PmxTable } from '@components/index';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import {
  ITransferRequestInDto,
  ITransferRequestResponse,
  TransferObjectType,
  TransferStatus,
} from '@store/griffin_api/auto_dsr/models/ITransferRequest';
import { useCreateTransferRequestMutation } from '@store/griffin_api/auto_dsr/slices/transferRequestsApi';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

import { IAircraftTransferTransformation } from './helper';

interface Props extends IAircraftTransferTransformation {
  losingUnit: IUnitBrief | undefined;
  gainingUnit: IUnitBrief | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (success: boolean, adjudicated: boolean, count: number) => void;
}

/**
 * Transfer Aircraft Review Modal to review the aircraft transfer data before initiating the final request
 * @returns React.Node
 */

const AircraftTransferReviewModal = (props: Props): React.ReactNode => {
  const { transformedData, keyTitleMapping, columns, losingUnit, gainingUnit, open, setOpen, handleSubmit } = props;
  const [createTransferRequest, { isLoading }] = useCreateTransferRequestMutation();
  const appUser = useAppSelector(selectAppUser);

  const [conflictData, setConflictData] = useState<{
    serial: string;
    originating_unit: string;
    destination_unit: string;
  } | null>(null);

  const [isPermanent, setIsPermanent] = useState(true);

  const handleClose = () => setOpen(false);
  const handleCloseConflict = () => setConflictData(null);

  const handleConflictError = (data: ITransferRequestResponse) => {
    if (data && data.ids && data.message && typeof data.message === 'object') {
      handleClose(); // Close main modal
      setConflictData({
        serial: data.ids[0],
        originating_unit: data.message.originating_unit,
        destination_unit: data.message.destination_unit,
      });
      return true;
    }
    return false;
  };

  const handleSubmitTransfer = async () => {
    try {
      const serials: string[] = [];
      Object.values(transformedData).forEach((aircraftData) => {
        aircraftData.forEach((aircraft) => serials.push(aircraft.serial));
      });

      const transferRequest: ITransferRequestInDto = {
        aircraft: serials,
        originating_uic: losingUnit!.uic,
        destination_uic: gainingUnit!.uic,
        requested_by_user: appUser.userId,
        requested_object_type: TransferObjectType.AIRCRAFT,
        permanent_transfer: isPermanent,
        status: TransferStatus.NEW,
      };

      const response = await createTransferRequest(transferRequest).unwrap();

      // Case 1: API returns success: false but resolves the promise
      if (response.success === false) {
        if (handleConflictError(response)) return;
      }

      // Case 2: Standard success
      const adjudicated = response.message === 'Requests adjudicated automatically.';
      const responseCount = response.ids?.length ?? 0;
      const count = adjudicated && responseCount === 0 ? serials.length : responseCount;
      handleClose();
      handleSubmit(response.success, adjudicated, count);
    } catch (error: unknown) {
      const rtkError = error as { data?: ITransferRequestResponse };

      if (rtkError.data && handleConflictError(rtkError.data)) {
        return;
      }

      console.error('Submission Error:', error);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Paper
          sx={{
            width: '50%',
            padding: '20px 16px',
            margin: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
          }}
        >
          <Stack direction="column" spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Transfer Aircraft</Typography>
              <Button onClick={handleClose} sx={{ color: (theme) => theme.palette.text.primary }}>
                <CloseIcon fontSize="small" data-testid="aircraft-transfer-close-btn" />
              </Button>
            </Stack>
            <Typography>Review the transfer details.</Typography>
            <Box sx={{ maxHeight: '70vh', overflowY: 'scroll' }}>
              {Object.entries(transformedData).map(([key, rows]) => (
                <Card sx={{ mb: 4, p: 3 }} key={key}>
                  <Stack direction="row" justifyContent="space-between" alignItems="left" gap={2} sx={{ p: 2 }}>
                    <Box width={'45%'}>
                      <Typography variant="caption" color="text.secondary">
                        Transfer From:
                      </Typography>
                      <Typography>{keyTitleMapping[key]}</Typography>
                    </Box>
                    <Box alignSelf={'center'}>
                      <ArrowForward />
                    </Box>
                    <Box width={'45%'}>
                      <Typography variant="caption" color="text.secondary">
                        Transfer To:
                      </Typography>
                      <Typography>{gainingUnit?.displayName}</Typography>
                    </Box>
                  </Stack>
                  <PmxTable rows={rows} columns={columns} />
                </Card>
              ))}
            </Box>
            <FormControlLabel
              control={
                <Checkbox checked={isPermanent} onChange={(e) => setIsPermanent(e.target.checked)} color="primary" />
              }
              label={<Typography variant="body2">Permanent Transfer</Typography>}
              sx={{ ml: 1 }}
            />
            <Stack direction="row" spacing={3} justifyContent="flex-end">
              <Button
                color="primary"
                variant="outlined"
                onClick={handleClose}
                data-testid="aircraft-transfer-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitTransfer}
                variant="contained"
                disabled={isLoading}
                data-testid="aircraft-transfer-submit-btn"
                startIcon={isLoading && <CircularProgress size={16} />}
              >
                Transfer
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Modal>

      {/* The Conflict Dialog */}
      <Dialog
        open={Boolean(conflictData)}
        onClose={handleCloseConflict}
        PaperProps={{ sx: { borderRadius: 2, minWidth: '400px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Adjudication Required</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              A transfer request already exists for serial: <strong>{conflictData?.serial}</strong>.
            </Typography>
            <Box
              sx={{
                bgcolor: 'action.hover',
                p: 2,
                borderRadius: 1,
                borderLeft: '4px solid',
                borderColor: 'error.main',
              }}
            >
              <Typography variant="body2">
                <strong>Origin:</strong> {conflictData?.originating_unit}
              </Typography>
              <Typography variant="body2">
                <strong>Destination:</strong> {conflictData?.destination_unit}
              </Typography>
            </Box>
            <Typography variant="body2">Please adjudicate this request before advancing.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseConflict} variant="contained">
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AircraftTransferReviewModal;
