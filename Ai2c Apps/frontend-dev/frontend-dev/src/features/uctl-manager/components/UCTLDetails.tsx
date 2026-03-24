import { useEffect, useState } from 'react';

import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import { OrgNode } from '@components/PmxOrgChart';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import { ITasks, IUCTLTasks } from '@features/task-explorer';
import { FetchUctlParams, useLazyGetUnitTasksQuery } from '@store/amap_ai/tasks';
import { StatusType } from '@utils/constants';

import UCTLTable from './UCTLTable';

const UCTLDetails = ({
  unit,
  mos,
  skillLevel,
  shouldRefresh,
  onRefreshHandled,
}: {
  unit: OrgNode | null;
  mos: string | null;
  skillLevel: string | null;
  shouldRefresh: boolean;
  onRefreshHandled: () => void;
}) => {
  const theme = useTheme();
  const [fetchUctl, { data, isFetching }] = useLazyGetUnitTasksQuery();
  const [selectedUctlId, setSelectedUctlId] = useState<number | null>(null);

  const getUCTL = () => {
    if (!unit?.id) return;

    const params: FetchUctlParams = { uic: unit.id };

    if (mos) {
      params.mos = mos;
    }

    if (skillLevel) {
      params.skill_level = skillLevel;
    }

    fetchUctl(params)
      .then()
      .finally(() => onRefreshHandled());
  };

  useEffect(() => {
    getUCTL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id, mos, skillLevel, fetchUctl, shouldRefresh]);

  // Auto-select first UCTL if only one
  useEffect(() => {
    if (data?.uctls?.length === 1) {
      setSelectedUctlId(data.uctls[0].ictlId as number);
    }
  }, [data]);

  const selectedUctl: IUCTLTasks | undefined = data?.uctls?.find((uctl) => uctl.ictlId === selectedUctlId);

  const uniqueMOS = Array.from(new Set(unit?.metaData?.map((mos) => mos.name ?? mos.id)));

  const uniqueSkillLevels = Array.from(
    new Set(unit?.metaData?.flatMap((mos) => mos.children ?? []).map((sl) => sl.name ?? sl.id)),
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {data?.uctls && data?.uctls?.length > 1 && (
        <>
          <Box mb={2}>
            <PmxDropdown
              options={data?.uctls.map((x) => ({ label: x.ictlTitle, value: x.ictlId.toString() })) ?? []}
              value={selectedUctlId?.toString()}
              label="Select Available UCTL/ICTL"
              onChange={(val) => setSelectedUctlId(Number(val))}
              loading={isFetching}
            />
          </Box>
          <Divider
            sx={{
              mt: 4,
              mb: 4,
              borderColor: theme.palette.mode === 'light' ? theme.palette.grey.l40 : theme.palette.grey.d40,
            }}
          />
        </>
      )}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        {unit ? (
          <>
            <Typography variant="h6" gutterBottom>
              {selectedUctl?.ictlTitle ?? '---'}
            </Typography>
            <Box display="flex" gap={4}>
              <Typography variant="body2">
                <strong>Unit:</strong> {unit.title ?? 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>MOS:</strong> {(!mos ? uniqueMOS.join(', ') : mos) || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>SL:</strong> {(!skillLevel ? uniqueSkillLevels.join(', ') : skillLevel) || 'N/A'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Last Updated on:</strong> {selectedUctl?.datePublished ?? '---'}
            </Typography>
          </>
        ) : (
          <Typography>---</Typography>
        )}
      </Paper>
      <UCTLTable
        tableProps={{
          columns: [
            { field: 'taskNumber', header: 'Task #' },
            {
              field: 'taskTitle',
              header: 'Task Title',
              renderCell: (_rowData: string | number | null, row: ITasks) => (
                <a href={row?.pdfUrl ?? '#'} target="_blank" rel="noreferrer">
                  {row.taskTitle}
                </a>
              ),
            },
            {
              field: 'status',
              header: 'Status',
              renderCell: (_rowData: string | number | null) => (
                <StatusDisplay status={selectedUctl?.status as StatusType} iconOnly />
              ),
            },
          ],
          data: selectedUctl?.tasks ?? [],
          getRowId: (task: ITasks) => task.taskNumber,
          isLoading: isFetching,
        }}
      />
    </Box>
  );
};

export default UCTLDetails;
