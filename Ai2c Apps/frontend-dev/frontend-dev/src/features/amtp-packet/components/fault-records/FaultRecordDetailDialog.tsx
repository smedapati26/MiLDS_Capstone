import { useEffect } from 'react';

import { Dialog, DialogContent, DialogTitle, Grid, Skeleton, Stack, Typography } from '@mui/material';

import PmxContainer from '@components/PmxContainer';
import { PmxIconLink } from '@components/PmxIconLink';
import { Column } from '@components/PmxTable';
import { PmxTableBasic } from '@components/tables';
import { setFaultRecord, setMaintainer } from '@features/amtp-packet/slices';
import { FaultAction, FaultDetails } from '@store/amap_ai/faults/models';
import { useLazyGetFaultByIdQuery } from '@store/amap_ai/faults/slices/faultsApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

// eslint-disable-next-line react-refresh/only-export-components
export const faultActionColumns: Column<FaultAction>[] = [
  { field: 'faultActionId', header: '13-2' },
  {
    field: 'discoveredOn',
    header: 'Discovered On',
  },
  {
    field: 'closedOn',
    header: 'Closed On',
  },
  { field: 'closerName', header: 'Closer' },
  { field: 'maintenanceAction', header: 'Maintenance Action' },
  { field: 'actionStatus', header: 'Action' },
  { field: 'inspectorName', header: 'Inspector' },
  { field: 'manHours', header: 'MMH' },
  { field: 'faultWorkUnitCode', header: 'WUC' },
];

interface FaultRecordDetailDialogProps {
  open: boolean;
  handleClose: () => void;
  faultId: string;
}

const FaultRecordDetailDialog = ({ open, faultId, handleClose }: FaultRecordDetailDialogProps) => {
  const [fetchFaultDetails, { data, isFetching }] = useLazyGetFaultByIdQuery();
  const dispatch = useAppDispatch();
  const { maintainer } = useAppSelector((state) => state.amtpPacket);

  useEffect(() => {
    if (open && faultId) {
      fetchFaultDetails({ fault_id: faultId });
    }
  }, [open, faultId, fetchFaultDetails]);

  const fault: FaultDetails | undefined = data;

  const renderDateOrSkeleton = (date: string | undefined) => {
    if (isFetching) return <Skeleton width={120} />;
    if (date) return new Date(date).toLocaleDateString();
    return '--';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>{isFetching ? <Skeleton width={200} /> : `13-1: ${fault?.faultId ?? faultId}`}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <PmxContainer>
              <Typography variant="body2" mb={4}>
                {isFetching ? <Skeleton width={300} /> : `Fault ID: ${fault?.faultId ?? '--'}`}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 3 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Discoverer: {isFetching ? <Skeleton width={120} /> : (fault?.discovererName ?? '--')}
                    </Typography>
                    <Typography variant="body2">
                      Discovered On:
                      {renderDateOrSkeleton(fault?.discoveredOn)}
                    </Typography>
                    <Typography variant="body2">Corrected On: {renderDateOrSkeleton(fault?.correctedOn)}</Typography>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 3 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Aircraft: {isFetching ? <Skeleton width={120} /> : (fault?.aircraft ?? '--')}
                    </Typography>
                    <Typography variant="body2">
                      Unit: {isFetching ? <Skeleton width={120} /> : (fault?.unitName ?? '--')}
                    </Typography>
                    <Typography variant="body2">
                      WUC: {isFetching ? <Skeleton width={120} /> : (fault?.faultWorkUnitCode ?? '--')}
                    </Typography>
                    <Typography variant="body2">
                      13-1 MMH: {isFetching ? <Skeleton width={120} /> : (fault?.totalManHours ?? '--')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Remarks: {isFetching ? <Skeleton width="100%" /> : (fault?.remarks ?? '--')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </PmxContainer>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PmxTableBasic
              columns={[
                ...faultActionColumns,
                {
                  field: 'maintainers',
                  header: 'Maintainer',
                  renderCell: (_val, row) => (
                    <PmxIconLink
                      label="Fault Details Open Button"
                      text={row.maintainers[0]?.name ?? '--'}
                      align="right"
                      onClick={() => {
                        if (maintainer?.id !== row.maintainers[0]?.userId) {
                          dispatch(
                            setMaintainer({
                              id: row.maintainers[0]?.userId,
                              name: row.maintainers[0]?.name,
                              pv2Dor: null,
                              pfcDor: null,
                              sfcDor: null,
                              sgtDor: null,
                              spcDor: null,
                              ssgDor: null,
                            }),
                          );
                        }

                        dispatch(setFaultRecord(row.faultActionId));

                        handleClose();
                      }}
                    />
                  ),
                },
              ]}
              data={fault?.faultActions ?? []}
              loading={isFetching}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default FaultRecordDetailDialog;
