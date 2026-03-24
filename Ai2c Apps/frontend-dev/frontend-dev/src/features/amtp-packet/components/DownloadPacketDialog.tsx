import { useState } from 'react';

import { useSnackbar } from '@context/SnackbarProvider';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxCheckboxTree from '@components/PmxCheckboxTree';
import { Packets, useDownloadPacketMutation } from '@store/amap_ai/readiness';
import { ISoldier, useGetUnitSoldiersQuery } from '@store/amap_ai/soldier';
import { useAppSelector } from '@store/hooks';

const checkboxes = [
  {
    id: 'allCtls',
    label: 'All CTLS',
    children: [
      { id: 'uctls', label: 'UCTLS' },
      { id: 'ictls', label: 'ICTLS' },
    ],
  },
  {
    id: 'maintainerRecord',
    label: 'Maintainer Record (DA 7817)',
  },
  {
    id: 'counseling',
    label: 'Counselings (DA 4856)',
  },
  {
    id: 'supportingDocs',
    label: 'Supporting Documents',
  },
];

const DownloadPacketDialog = () => {
  const { showAlert } = useSnackbar();
  const { maintainer } = useAppSelector((state) => state.amtpPacket);
  const { appUser, currentUic } = useAppSelector((state) => state.appSettings);
  const [selectedSoldiers, setSelectedSoldiers] = useState<string[] | null>(maintainer?.id ? [maintainer.id] : null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPackets, setSelectedPackets] = useState<Packets>({
    ictls: false,
    uctls: false,
    maintainerRecord: false,
    counseling: false,
    supportingDocs: false,
  });

  const { data, isLoading: soldiersLoading } = useGetUnitSoldiersQuery({
    uic: currentUic ?? '',
    type: 'all_maintainers',
  });
  const soldiers = data?.soldiers ?? [];

  const [downloadPacket, { isLoading }] = useDownloadPacketMutation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = async () => {
    const res = await downloadPacket({
      soldier_ids: selectedSoldiers as string[],
      packets: selectedPackets,
    });

    if (res?.error) {
      showAlert(
        `Requesting user ${appUser?.rank ?? ''} ${appUser?.firstName ?? ''} ${appUser?.lastName ?? ''} does not have user role for every soldier's unit which is required to perform this action`,
        'error',
        false,
      );
      return;
    }

    showAlert('Document(s) downloaded', 'success', false);
  };

  return (
    <>
      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleClickOpen} sx={{ ml: 3 }}>
        Download Packet
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Download Packet</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Typography>Select all or portions of the soldier&apos;s Packet to download.</Typography>
          <PmxDropdown
            multiple
            options={
              soldiers?.map((x: ISoldier) => ({ label: `${x.rank} ${x.firstName} ${x.lastName}`, value: x.userId })) ||
              []
            }
            value={selectedSoldiers ?? []}
            label="Soldier"
            onChange={(value: string | string[]) => {
              setSelectedSoldiers(value as string[]);
            }}
            loading={soldiersLoading}
            containerSx={{ mt: 3 }}
          />
          <Box m={3}>
            <PmxCheckboxTree
              checkboxes={checkboxes}
              allChecked
              values={selectedPackets}
              onChange={(values) => setSelectedPackets(values as Packets)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} color="primary" size="large">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            color="primary"
            size="large"
            startIcon={
              !isLoading ? (
                <DownloadIcon />
              ) : (
                <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
              )
            }
            disabled={
              Object.values(selectedPackets).every((value) => value === false) ||
              !selectedSoldiers ||
              selectedSoldiers.length === 0
            }
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DownloadPacketDialog;
