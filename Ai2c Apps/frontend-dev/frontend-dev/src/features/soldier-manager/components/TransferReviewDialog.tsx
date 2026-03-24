import { useSnackbar } from '@context/SnackbarProvider';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from '@mui/material';

import { useAdjudicateTransferRequestsMutation } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';
import { useAdjudicatePermissionRequestsMutation } from '@store/amap_ai/user_request/slices/userRequestApiSlice';
import { useAppSelector } from '@store/hooks';

export type TransferItem =
  | {
      type: 'transfer';
      requestId: number;
      name: string;
      rank: string;
      dodId: string;
      fromUnit: string;
      fromUic: string;
      toUnit: string;
      requestedBy: string;
    }
  | {
      type: 'permission';
      requestId: number;
      name: string;
      rank: string;
      dodId: string;
      unit: string;
      lastActive: string;
      currentRole: string;
      requestedRole: string;
    };

interface ITransferDialogProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: () => void;
  data: TransferItem[];
  transferType: 'Approve' | 'Reject';
}

const TransferReviewDialog = ({ open, onSubmit, handleClose, transferType, data }: ITransferDialogProps) => {
  const { showAlert } = useSnackbar();
  const { appUser } = useAppSelector((state) => state.appSettings);

  const [adjudicatePermission, { isLoading: loadingPermission }] = useAdjudicatePermissionRequestsMutation();
  const [adjudicateTransfer, { isLoading: loadingTransfer }] = useAdjudicateTransferRequestsMutation();

  const handleSubmit = async () => {
    const approved = transferType === 'Approve';
    const adjudicator_dod_id = appUser?.userId ?? '1234567890';

    const permissionIds = data.filter((item) => item.type === 'permission').map((item) => item.requestId);

    const transferIds = data.filter((item) => item.type === 'transfer').map((item) => item.requestId);

    try {
      if (permissionIds.length > 0) {
        await adjudicatePermission({
          request_ids: permissionIds,
          approved,
          adjudicator_dod_id,
        });
      }

      if (transferIds.length > 0) {
        await adjudicateTransfer({
          request_ids: transferIds,
          approved,
          adjudicator_dod_id,
        });
      }

      showAlert(`${data.length} soldier request(s) ${approved ? 'approved' : 'rejected'}.`, 'success', false);

      onSubmit();
    } catch {
      showAlert('An error occurred while adjudicating requests.', 'error', false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Soldier Request(s)</DialogTitle>

      <DialogContent>
        <Typography mb={4}>Review the following request information.</Typography>

        {data.map((item) => (
          <Card key={item.requestId} sx={{ p: 4, mb: 4 }}>
            <Typography fontWeight="bold" mb={1}>
              {item.name} ({item.rank})
            </Typography>
            <Typography variant="body2" mb={2}>
              DoD ID: {item.dodId}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {item.type === 'transfer' && (
              <>
                <Grid container>
                  <Grid size={{ xs: 5 }}>
                    <Typography mb={1}>Transfer From:</Typography>
                    <Typography fontWeight="bold">
                      {item.fromUnit} ({item.fromUic})
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowForwardIcon />
                  </Grid>

                  <Grid size={{ xs: 5 }}>
                    <Typography mb={1}>Transfer To:</Typography>
                    <Typography fontWeight="bold">{item.toUnit}</Typography>
                  </Grid>
                </Grid>

                <Typography mt={3} variant="body2">
                  Requested By: <strong>{item.requestedBy}</strong>
                </Typography>
              </>
            )}

            {item.type === 'permission' && (
              <>
                <Grid container>
                  <Grid size={{ xs: 5 }}>
                    <Typography mb={1}>Current Role:</Typography>
                    <Typography fontWeight="bold">{item?.currentRole ?? 'n/a'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowForwardIcon />
                  </Grid>

                  <Grid size={{ xs: 5 }}>
                    <Typography mb={1}>Requested Role:</Typography>
                    <Typography fontWeight="bold">{item.requestedRole}</Typography>
                  </Grid>
                </Grid>

                <Typography mt={3} variant="body2">
                  Last Active: <strong>{item.lastActive}</strong>
                </Typography>
              </>
            )}
          </Card>
        ))}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose} size="large">
          Cancel
        </Button>

        <Button
          variant="contained"
          color={transferType === 'Approve' ? 'primary' : 'error'}
          onClick={handleSubmit}
          size="large"
          {...((loadingTransfer || loadingPermission) && {
            startIcon: (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            ),
          })}
        >
          {transferType}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferReviewDialog;
