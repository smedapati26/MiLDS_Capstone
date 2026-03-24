import { useEffect, useState } from 'react';

import { Skeleton } from '@mui/material';

import { Column } from '@components/PmxTable';
import { faultRecordsCols } from '@features/amtp-packet/constants';
import { FaultAction } from '@store/amap_ai/faults/models';
import { useLazyGetSoldierFaultsHistoryQuery } from '@store/amap_ai/faults/slices/faultsApi';
import { useAppSelector } from '@store/hooks';

import { FaultRecordDetailDialog } from '../fault-records';
import { AmtpTable } from '../tables/AmtpTable';

const FaultRecordsTab = () => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [getFaultRecords, { data, isFetching }] = useLazyGetSoldierFaultsHistoryQuery();
  const [faultId, setFaultId] = useState<string | undefined>(undefined);
  const { faultRecord } = useAppSelector((state) => state.amtpPacket);

  useEffect(() => {
    if (maintainer?.id) getFaultRecords({ soldier_id: maintainer.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintainer]);

  {
    /* COMMENTING OUT FUNCTION UNTIL ENDPOINT IS CREATED */
  }
  // const getAverageManHours = (data: FaultAction[]) => {
  //   if (!data || data.length === 0) return '0.00';
  //   const total = data.reduce((sum, x) => sum + x.manHours, 0);
  //   return (total / data.length).toFixed(2);
  // };

  return (
    <>
      {/* COMMENTING OUT STATIC CODE UNTIL ENDPOINT IS CREATED */}
      {/* <Grid container spacing={2}>
        <Grid size={{xs: 9}}>
          <PmxContainer>
            <PmxBarChart
              data={[
                { data: [4], label: `${maintainer?.name}; [MOS]-[ML]`, color: theme.palette.graph.teal2 },
                { data: [8], label: `Avg. [MOS]-[ML] Soldier w/in Army`, color: theme.palette.graph.cyan2 },
              ]}
              title="Phases Soldiers Participated In"
            />
          </PmxContainer>
        </Grid>
        <Grid size={{xs: 3}}>
          <Grid container gap={2}>
            <Grid size={{xs: 12}}>
              <PmxContainer>
                <Typography variant="h6">Maintenance Man Hours</Typography>
                <Box display="flex" justifyContent="center" alignItems="center" gap={4} mt={8}>
                  <Box textAlign="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      {!isFetching && (
                        <Typography sx={{ fontSize: '2.5rem !important' }}>
                          {data?.reduce((sum, x) => sum + x.manHours, 0) ?? 0}
                        </Typography>
                      )}
                      {isFetching && <Skeleton variant="rectangular" width={70} height={30} />}
                      <Typography sx={{ fontSize: '0.75rem !important' }}>Hrs</Typography>
                    </Box>
                    <Typography variant="h6" mt={4} fontWeight={300}>
                      Total
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                      {!isFetching && (
                        <Typography sx={{ fontSize: '2.5rem !important' }}>
                          {getAverageManHours(data as FaultAction[])}
                        </Typography>
                      )}
                      {isFetching && <Skeleton variant="rectangular" width={70} height={30} />}
                      <Typography sx={{ fontSize: '0.75rem !important' }}>Hrs</Typography>
                    </Box>
                    <Typography variant="h6" mt={4} fontWeight={300}>
                      Avg/MX Action
                    </Typography>
                  </Box>
                </Box>
              </PmxContainer>
            </Grid>
            <Grid size={{xs: 12}}>
              <PmxContainer>
                <Typography variant="h6">Entries within Last Month</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  {!isFetching && (
                    <Typography sx={{ fontSize: '2.5rem !important', m: 4 }}>
                      {data?.filter((x) => {
                        if (!x.discoveredOn) return false;
                        const date = new Date(x.discoveredOn as string);
                        const now = new Date();
                        return (
                          !isNaN(date.getTime()) &&
                          date.getMonth() === now.getMonth() &&
                          date.getFullYear() === now.getFullYear()
                        );
                      }).length ?? 0}
                    </Typography>
                  )}
                  {isFetching && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
                      <Skeleton variant="rectangular" width={70} height={30} />
                    </Box>
                  )}
                  <Typography variant="h6" fontWeight={300}>
                    Total
                  </Typography>
                </Box>
              </PmxContainer>
            </Grid>
          </Grid>
        </Grid>
      </Grid> */}
      {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

      {data && !isFetching && (
        <AmtpTable
          tableProps={{
            columns: faultRecordsCols((val) => setFaultId(val)) as Column<FaultAction>[],
            data: data ?? [],
            getRowId: (data) => `${data.faultActionId}`,
            isLoading: isFetching,
            tableTitle: 'Fault Records',
            highlightedRows: [faultRecord as string],
          }}
          filterType="fault_records"
        />
      )}

      <FaultRecordDetailDialog open={!!faultId} faultId={faultId ?? ''} handleClose={() => setFaultId(undefined)} />
    </>
  );
};

export default FaultRecordsTab;
