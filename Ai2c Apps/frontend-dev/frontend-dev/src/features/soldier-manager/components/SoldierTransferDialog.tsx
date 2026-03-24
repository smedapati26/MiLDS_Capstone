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

export interface TransferSoldier {
  dodId: string;
  name: string;
}

interface ISoldierTransferDialogProps {
  open: boolean;
  handleClose: () => void;
  data: Array<{
    id: string;
    label: string;
    children: TransferSoldier[];
  }>;
  newUnit: string;
  isLoading?: boolean;
  handleSubmit: () => void;
}

const SoldierTransferDialog = ({
  open = false,
  data,
  newUnit,
  isLoading,
  handleClose,
  handleSubmit,
}: ISoldierTransferDialogProps) => {
  return (
    <Dialog onClose={handleClose} open={open} aria-label="Soldier Transfer Request" maxWidth="sm" fullWidth>
      <DialogTitle>Soldier Transfer Confirmation</DialogTitle>
      <DialogContent>
        <Typography mb={4}>Review the following transfer information.</Typography>
        {data?.map((unit) => (
          <Card
            key={unit.label}
            sx={{
              p: 4,
              mb: 4,
              border: '1px solid transparent',
              '&:hover': {
                borderColor: 'transparent',
              },
            }}
          >
            <Typography mb={1}>Soldier(s):</Typography>
            {unit?.children.map((soldier) => (
              <Typography key={soldier.name} fontWeight="bold">
                {soldier.name}
              </Typography>
            ))}
            <Divider sx={{ mt: 4, mb: 4 }} />
            <Grid container>
              <Grid size={{ xs: 5 }}>
                <Typography mb={2}>Transfer From:</Typography>
                <Typography fontWeight="bold">{unit.label}</Typography>
              </Grid>
              <Grid size={{ xs: 2 }}>
                <ArrowForwardIcon />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <Typography mb={2}>Transfer To:</Typography>
                <Typography fontWeight="bold">{newUnit}</Typography>
              </Grid>
            </Grid>
          </Card>
        ))}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} color="primary" size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          color="primary"
          size="large"
          {...(isLoading && {
            startIcon: (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            ),
          })}
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoldierTransferDialog;
