import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Paper, styled, ToggleButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import { Column, PmxTable } from '@components/PmxTable';
import EventDialog from '@features/amtp-packet/components/maintainer-record/EventDialog';
import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';
import { setMaintainer } from '@features/amtp-packet/slices';
import { IEventReportSoldier } from '@store/amap_ai/unit_health';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch } from '@store/hooks';
import { handleCopy, handleExportCsv, handleExportExcel, handleExportPdf, handlePrint } from '@utils/helpers';

export interface IEventsReportProps {
  reportTitle: string;
  reportData: IEventReportSoldier[] | undefined;
  reportColumns: Column<IEventReportSoldier>[];
  filterValue: string;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
  reportEvents: string[];
}

export const EventsReport: React.FC<IEventsReportProps> = ({
  reportTitle,
  reportData,
  reportColumns,
  filterValue,
  setFilterValue,
  reportEvents,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [trigger] = useLazyGetUserQuery();
  const theme = useTheme();
  const [viewBy, setViewBy] = useState<'date' | 'totalCount'>('date');
  const [eventDialogOpen, setEventDialogOpen] = useState<boolean>(false);
  const [eventDialogId, setEventDialogId] = useState<number | undefined>(undefined);
  const [eventDialogUserId, setEventDialogUserId] = useState<string | undefined>(undefined);

  const handleClickEventDate = (eventId: number, userId: string) => {
    setEventDialogId(eventId);
    setEventDialogOpen(true);
    setEventDialogUserId(userId);
  };

  const handleCallback = async () => {
    if (eventDialogUserId) {
      const currentSoldier = await trigger({ userId: eventDialogUserId }).unwrap();

      const selectedSoldier = {
        id: currentSoldier.userId,
        name: `${currentSoldier.rank} ${currentSoldier?.firstName} ${currentSoldier?.lastName}`,
        pv2Dor: currentSoldier?.pv2Dor as string,
        pfcDor: currentSoldier?.pfcDor as string,
        sfcDor: currentSoldier?.sfcDor as string,
        sgtDor: currentSoldier?.sgtDor as string,
        spcDor: currentSoldier?.spcDor as string,
        ssgDor: currentSoldier?.ssgDor as string,
      };

      await dispatch(setMaintainer(selectedSoldier));
      navigate('/amtp-packet');
    }
  };

  const ThemedToggleButton = styled(ToggleButton)({
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey.main,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : '#99C7F5',
      borderColor: theme.palette.primary.main,
    },
  });

  const eventReportColumns: Column<IEventReportSoldier>[] = useMemo(() => {
    return [
      ...reportColumns,
      ...reportEvents.map((currentEvent) => ({
        field: currentEvent
          .toLowerCase()
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase())),
        header: currentEvent,
        renderCell: (_: string, soldier: IEventReportSoldier) => {
          // eslint-disable-next-line sonarjs/no-nested-functions
          const relatedEvent = soldier.events.find((event) => event.type === currentEvent);

          let icon = <></>;

          if (relatedEvent?.result === 'GO') {
            icon = <CheckIcon sx={{ height: '20px', width: '20px' }} />;
          } else if (relatedEvent?.result === 'NOGO') {
            icon = <CloseIcon sx={{ height: '20px', width: '20px' }} />;
          }

          if (viewBy === 'date') {
            return relatedEvent ? (
              <Button
                size="small"
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': { backgroundColor: theme.palette.action.hover, cursor: 'pointer' },
                }}
                // eslint-disable-next-line sonarjs/no-nested-functions
                onClick={() => handleClickEventDate(relatedEvent.id, soldier.soldierId)}
              >
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {icon}
                  {relatedEvent?.date ?? '--'}
                </Typography>
              </Button>
            ) : (
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {icon}
                {'--'}
              </Typography>
            );
          } else {
            return <Typography>{relatedEvent?.occurences?.length ?? 0}</Typography>;
          }
        },
      })),
    ] as Column<IEventReportSoldier>[];
  }, [reportColumns, reportEvents, theme, viewBy]);

  const filteredData = useMemo(() => {
    const lowercaseFilter = filterValue.toLowerCase();

    return reportData?.filter((soldier) => {
      const nameMatch = soldier.soldierName.toLowerCase().includes(lowercaseFilter);
      const mosMatch = soldier.mos?.toLowerCase().includes(lowercaseFilter) ?? true;
      const unitMatch = soldier.unit.toLowerCase().includes(lowercaseFilter);

      return nameMatch || mosMatch || unitMatch;
    });
  }, [reportData, filterValue]);

  return (
    <Box sx={{ py: 2 }}>
      {reportData && (
        <Paper sx={{ px: 4, pb: 4, mb: 2 }} aria-label="Events Report Table">
          <PmxTable
            tableTitle={reportTitle}
            headerDialogs={
              <Box display={'flex'} alignItems={'center'} gap={2}>
                <Typography>View By:</Typography>
                <ThemedToggleButton
                  aria-label="Latest Date View By Button"
                  value="date"
                  selected={viewBy === 'date'}
                  onChange={() => setViewBy('date')}
                  sx={{ mr: 2, borderRadius: 2 }}
                >
                  {viewBy === 'date' && (
                    <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="date-checked" />
                  )}
                  Latest Date
                </ThemedToggleButton>

                <ThemedToggleButton
                  aria-label="Total Count View By Button"
                  value="totalCount"
                  selected={viewBy === 'totalCount'}
                  onChange={() => setViewBy('totalCount')}
                  sx={{ mr: 2, borderRadius: 2 }}
                >
                  {viewBy === 'totalCount' && (
                    <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="total-count-checked" />
                  )}
                  Total Count
                </ThemedToggleButton>
                <PmxSearch value={filterValue} onChange={(event) => setFilterValue(event.target.value)} />
                <ExportMenu
                  handleCsv={() => handleExportCsv(filteredData ?? [], reportTitle)}
                  handleExcel={() => handleExportExcel(eventReportColumns, filteredData ?? [], reportTitle)}
                  handlePdf={() => handleExportPdf(eventReportColumns, filteredData ?? [], reportTitle)}
                  handleCopy={() => handleCopy(eventReportColumns, filteredData ?? [])}
                  handlePrint={() => handlePrint(eventReportColumns, filteredData ?? [], reportTitle)}
                />
              </Box>
            }
            columns={eventReportColumns}
            data={filteredData ?? []}
            getRowId={(data) => data.soldierId}
            enforceHeight={false}
          />
        </Paper>
      )}
      <EventDialog
        open={eventDialogOpen}
        handleClose={() => {
          setEventDialogOpen(false);
          setEventDialogId(undefined);
        }}
        formSubmitted={() => {}}
        dialogType="view"
        title="View Event"
        eventId={eventDialogId}
        actions={
          <Box>
            <Button
              variant="outlined"
              sx={{ mr: 4 }}
              onClick={() => {
                setEventDialogId(undefined);
                setEventDialogOpen(false);
              }}
            >
              Close
            </Button>
            <Button variant="contained" onClick={handleCallback}>
              Go To AMTP Packet
            </Button>
          </Box>
        }
      />
    </Box>
  );
};
