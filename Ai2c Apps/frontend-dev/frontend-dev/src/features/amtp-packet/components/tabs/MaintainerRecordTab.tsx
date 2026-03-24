import React, { useEffect, useState } from 'react';

import useRefreshUserdata from '@hooks/useRefreshUserData';
import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import { Box, Skeleton, Theme, useTheme } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import ActionBtns from '@components/ActionBtns';
import { PmxAccordion, PmxLineGraph, PmxSplitButton } from '@components/index';
import { ColorType } from '@components/PmxLineGraph';
import { maintainerRecordCols } from '@features/amtp-packet/constants';
import { IDa7817s, useDeleteEventMutation, useGetDa7817sQuery } from '@store/amap_ai/events';
import { useAppSelector } from '@store/hooks';

import EventDialog from '../maintainer-record/EventDialog';
import MassEventDialog from '../maintainer-record/MassEventDialog';
import SupportingDocsDialog from '../maintainer-record/SupportingDocsDialog';
import XMLUploadDialog from '../maintainer-record/XMLUploadDialog';
import { AmtpTable } from '../tables/AmtpTable';

const options = [
  {
    label: 'Mass Training',
    children: [{ label: 'Training' }, { label: 'Award' }, { label: 'TCS' }],
  },
  {
    label: 'Initial Upload',
    children: [{ label: 'XML File Upload' }, { label: 'Manual Entry' }],
  },
];

type DialogType = 'view' | 'edit' | 'add' | 'initial_upload';

const rankMapping: Record<string, number> = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`ML${i}`, i + 1]));

const getColor = (color: ColorType | null, theme: Theme) => {
  switch (color) {
    case 'purple':
      return theme.palette.graph.purple2;
    case 'teal':
      return theme.palette.graph.teal2;
    case 'cyan':
      return theme.palette.graph.cyan2;
    case 'blue':
      return theme.palette.graph.blue;
    case 'magenta':
      return theme.palette.graph.magenta;
    default:
      return theme.palette.graph.magenta;
  }
};
const MaintainerRecordTab: React.FC = () => {
  const theme = useTheme();
  const refreshUserData = useRefreshUserdata;
  const { appUser } = useAppSelector((state) => state.appSettings);
  const { maintainer, eventId, eventType } = useAppSelector((state) => state.amtpPacket);
  const { hasRole } = useUnitAccess();
  const [xmlDialog, setXmlDialog] = useState<boolean>(false);
  const [supportDialog, setSupportDialog] = useState({
    isOpen: false,
    eventId: undefined as number | undefined,
  });
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'add' as DialogType,
    eventId: undefined as number | undefined,
    title: '',
  });
  const [massEventType, setMassEventType] = useState<'Training' | 'Award' | 'TCS' | undefined>(undefined);

  const { data, isFetching, refetch } = useGetDa7817sQuery({ user_id: maintainer?.id ?? '1234567890' });

  const [deleteEvent] = useDeleteEventMutation();

  useEffect(() => {
    if (eventId) {
      setDialogState({ type: 'edit', eventId, isOpen: true, title: 'Edit Event' });
    }
  }, [eventId]);

  useEffect(() => {
    if (eventType) {
      setDialogState({ type: 'add', eventId: undefined, isOpen: true, title: 'Add Event' });
    }
  }, [eventType]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintainer]);

  const getDialogTitle = (type: 'view' | 'edit' | 'add' | 'initial_upload'): string => {
    switch (type) {
      case 'view':
        return 'View Event';
      case 'edit':
        return 'Edit Event';
      case 'initial_upload':
        return 'Initial Upload - Manual Entry';
      default:
        return 'Add Event';
    }
  };

  const handleOpenDialog = (type: 'view' | 'edit' | 'add', eventId?: number) => {
    setDialogState({
      isOpen: true,
      type,
      eventId,
      title: getDialogTitle(type),
    });
  };

  const handleDeleteEvent = async (eventId: number) => {
    await deleteEvent(eventId);

    refetch();
  };

  const handleSplitButtonClick = (label: string) => {
    if (['Training', 'Award', 'TCS'].includes(label)) {
      setMassEventType(label as 'Training' | 'Award' | 'TCS');
    } else {
      const type = label !== 'Manual Entry' && label !== 'XML File Upload' ? 'add' : 'initial_upload';
      if (label === 'Manual Entry') {
        setDialogState({
          isOpen: true,
          type,
          eventId: undefined,
          title: getDialogTitle(type),
        });
        return;
      }
      if (label === 'XML File Upload') {
        setXmlDialog(true);
        return;
      }
      setDialogState({
        isOpen: true,
        type,
        eventId: undefined,
        title: getDialogTitle(type),
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false, eventId: undefined }));
  };

  const graphData = data
    ?.map((x) => {
      let type: 'Evaluation' | 'Training' | 'Award' | 'PCS/ETS' | 'Other';
      let color: ColorType;

      if (x.eventType === 'Evaluation') {
        type = 'Evaluation';
        color = getColor('purple', theme) as ColorType;
      } else if (x.eventType === 'Training') {
        type = 'Training';
        color = getColor('teal', theme) as ColorType;
      } else if (x.eventType === 'Award') {
        type = 'Award';
        color = getColor('cyan', theme) as ColorType;
      } else if (x.eventType === 'PCS/ETS') {
        type = 'PCS/ETS';
        color = getColor('blue', theme) as ColorType;
      } else {
        type = 'Other';
        color = getColor('magenta', theme) as ColorType;
      }

      return {
        xAxis: x.date,
        // Only change yAxis if event MOS matches soldier's primary MOS
        yAxis: x?.mos === maintainer?.primaryMos && x?.maintenanceLevel ? rankMapping[x.maintenanceLevel] : 0,
        color,
        ['Date']: x.date,
        ['Event Type']: type,
        Result: x.goNogo,
        Comment: x.comment,
        ['Associated Task(s)']: x.eventTasks?.length > 0 ? x.eventTasks.join(', ') : 'N/A',
      };
    })
    .sort((a, b) => new Date(a.xAxis).getTime() - new Date(b.xAxis).getTime());

  const promotionLines: { date: string; label: string }[] = [
    maintainer?.pv2Dor ? { date: maintainer.pv2Dor, label: 'PV2' } : null,
    maintainer?.pfcDor ? { date: maintainer.pfcDor, label: 'PFC' } : null,
    maintainer?.spcDor ? { date: maintainer.spcDor, label: 'SPC' } : null,
    maintainer?.sgtDor ? { date: maintainer.sgtDor, label: 'SGT' } : null,
    maintainer?.sfcDor ? { date: maintainer.sfcDor, label: 'SFC' } : null,
    maintainer?.ssgDor ? { date: maintainer.ssgDor, label: 'SSG' } : null,
  ].filter((item): item is { date: string; label: string } => !!item);

  return (
    <>
      {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

      {data && !isFetching && (
        <AmtpTable
          filterType="maintainer"
          tableProps={{
            columns: [
              ...maintainerRecordCols,
              {
                field: '',
                header: 'Actions',
                renderCell: (_data, row: IDa7817s) => {
                  return (
                    <>
                      {(hasRole('manager') || hasRole('recorder')) && (
                        <ActionBtns
                          handleEdit={() =>
                            handleOpenDialog(
                              (row.recordedById && row.recordedById === appUser?.userId) || hasRole('manager')
                                ? 'edit'
                                : 'view',
                              row.id,
                            )
                          }
                          handleView={() => setSupportDialog({ eventId: row.id, isOpen: true })}
                          hasAttachments={!!row.attachedDa_4856Id}
                          handleDelete={() => handleDeleteEvent(row.id)}
                        />
                      )}
                    </>
                  );
                },
              },
            ] as Column<IDa7817s>[],
            data,
            getRowId: (data: IDa7817s) => data.id,
            isLoading: isFetching,
            tableTitle: 'Soldier DA 7817 Events',
            titleBtn: (
              <Box mt={1} mb={1}>
                <PmxSplitButton
                  buttonTitle="ADD EVENT"
                  options={options}
                  handleClick={handleSplitButtonClick}
                  startIcon={<AddIcon />}
                  disabled={!(hasRole('manager') || hasRole('recorder'))}
                />
              </Box>
            ),
          }}
        />
      )}
      {supportDialog.isOpen && supportDialog.eventId && (
        <SupportingDocsDialog
          open={supportDialog.isOpen}
          eventId={supportDialog.eventId}
          handleClose={() => setSupportDialog({ isOpen: false, eventId: undefined })}
        />
      )}
      <XMLUploadDialog open={xmlDialog} handleClose={() => setXmlDialog(false)} />
      {dialogState.isOpen && (
        <EventDialog
          title={dialogState.title}
          open={dialogState.isOpen}
          eventId={dialogState.eventId}
          dialogType={dialogState.type}
          handleClose={handleCloseDialog}
          formSubmitted={() => {
            refetch();
            if (maintainer) {
              refreshUserData(maintainer.id);
            }
            handleCloseDialog();
          }}
        />
      )}

      {massEventType && (
        <MassEventDialog
          eventType={massEventType}
          open={!!massEventType}
          handleClose={() => setMassEventType(undefined)}
          formSubmitted={() => {
            refetch();
            if (maintainer) {
              refreshUserData(maintainer.id);
            }
            setMassEventType(undefined);
          }}
        />
      )}

      <Box mt={4} />
      {data && graphData && (
        <PmxAccordion
          heading="Soldier DA 7817 Graph View"
          isLoading={isFetching}
          sx={{ '& .MuiAccordionDetails-root': { height: '100%' } }}
        >
          <PmxLineGraph
            graphData={graphData}
            promotionLines={promotionLines}
            graphTitle="Soldier Event Timeline v. Maintenance Level"
            xAxisTitle="Date"
            yAxisTitle="Maintenance Level"
          />
        </PmxAccordion>
      )}
    </>
  );
};

export default MaintainerRecordTab;
