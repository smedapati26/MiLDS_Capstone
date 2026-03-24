import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

import { TransferRequest } from '@store/amap_ai/transfer_request';

interface ISoldierConfirmationDialogProps {
  open?: boolean;
  selectedSolider: TransferRequest;
  setSelectedSoldier: (val: undefined) => void;
  grantValue?: string;
  isLoading?: boolean;
  handleSubmit: () => void;
  handleChange?: ((event: React.ChangeEvent<HTMLInputElement>, value: string) => void) | undefined;
}

const SoldierConfirmationDialog = ({
  open = false,
  selectedSolider,
  setSelectedSoldier,
  grantValue,
  isLoading,
  handleChange,
  handleSubmit,
}: ISoldierConfirmationDialogProps) => {
  return (
    <Dialog
      onClose={() => {
        setSelectedSoldier(undefined);
      }}
      open={open}
      aria-label="Soldier Transfer Request"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Soldier Transfer Request</DialogTitle>
      <DialogContent>
        <Card
          sx={{
            p: 4,
            border: '1px solid transparent',
            '&:hover': {
              borderColor: 'transparent',
            },
          }}
        >
          <Typography fontWeight="bold" mb={4} mt={4}>
            {selectedSolider?.soldierName}
          </Typography>
          <Grid container>
            <Grid size={{ xs: 6 }}>
              <Typography mb={2}>Transfer From:</Typography>
              <Typography fontWeight="bold">{selectedSolider?.soldierUnitShortName}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography mb={2}>Transfer To:</Typography>
              <Typography fontWeight="bold">{selectedSolider?.gainingUnitShortName}</Typography>
            </Grid>
          </Grid>
        </Card>
        <FormControl sx={{ mt: 4 }}>
          <FormLabel id="group-label" sx={{ mb: 4 }}>
            If approved, other external transfer requests for this soldier will be removed. If denied, the other
            requests will remain unchanged.
          </FormLabel>
          <RadioGroup
            aria-labelledby="approval-group-label"
            defaultValue={true}
            name="radio-buttons-group"
            value={grantValue}
            onChange={handleChange}
          >
            <FormControlLabel value={true} control={<Radio />} label="Approve" />
            <FormControlLabel value={false} control={<Radio />} label="Deny" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setSelectedSoldier(undefined)} color="primary" size="large">
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
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoldierConfirmationDialog;
