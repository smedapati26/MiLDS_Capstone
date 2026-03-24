import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, Skeleton, useTheme } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { setEventId, setEventTask, setEventTrainingType, setEventType } from '@features/amtp-packet/slices';
import { ICtlsColumns, useLazyGetCtlsQuery } from '@store/amap_ai/readiness';
import { useLazyDownloadTaskQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { criticalTaskCols } from '../../constants';
import { AmtpTable } from '../tables/AmtpTable';

const CriticalTaskListTab: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasRole } = useUnitAccess();
  const theme = useTheme();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [getCtls, { data: { ictl = [], uctl = [] } = {}, isFetching = false }] = useLazyGetCtlsQuery();
  const [downloadTask] = useLazyDownloadTaskQuery();

  const handleCallback = async (value: number) => {
    await dispatch(setEventId(value));
    navigate('/amtp-packet/maintainer-record');
  };

  const handleDownload = async (taskNumber: string) => {
    try {
      const blob = await downloadTask({ task_number: taskNumber }).unwrap();

      if (!blob) return;

      const file = new File([blob], `Task Document ${taskNumber}.pdf`, {
        type: blob.type,
      });

      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  useEffect(() => {
    if (maintainer?.id) getCtls({ user_id: maintainer.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintainer]);

  return (
    <>
      {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

      {uctl?.length > 0 && !isFetching && (
        <AmtpTable
          tableProps={{
            columns: [
              ...criticalTaskCols(theme, handleCallback, handleDownload),
              {
                field: '',
                header: 'Actions',
                width: 150,
                renderCell: (_value, row) => {
                  return (
                    <>
                      {(hasRole('manager') || hasRole('recorder')) && (
                        <IconButton
                          color="primary"
                          aria-label="add"
                          onClick={() => {
                            dispatch(setEventType('Evaluation'));
                            dispatch(
                              setEventTask({
                                name: row.taskTitle,
                                number: row.taskNumber,
                                result: 'GO',
                              }),
                            );
                            navigate('/amtp-packet/maintainer-record');
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      )}
                    </>
                  );
                },
              },
            ] as Column<ICtlsColumns>[],
            data: uctl,
            getRowId: (data) => `${data.taskNumber}-${data.ictlIctlTitle}`,
            isLoading: isFetching,
            tableTitle: 'UCTL (Unit Critical Task List)',
          }}
          filterType="ctl"
        />
      )}
      {ictl?.length > 0 && !isFetching && (
        <AmtpTable
          tableProps={{
            columns: [
              ...criticalTaskCols(theme, handleCallback),
              {
                field: '',
                header: 'Actions',
                width: 150,
                renderCell: (_value, row) => {
                  return (
                    <IconButton
                      color="primary"
                      aria-label="add"
                      onClick={async () => {
                        dispatch(setEventType('Training'));
                        dispatch(setEventTrainingType('Evaluator Training'));
                        dispatch(
                          setEventTask({
                            name: row.taskTitle,
                            number: row.taskNumber,
                            result: 'GO',
                          }),
                        );
                        navigate('/amtp-packet/maintainer-record');
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  );
                },
              },
            ] as Column<ICtlsColumns>[],
            data: ictl,
            getRowId: (data) => `${data.taskNumber}-${data.ictlIctlTitle}`,
            isLoading: isFetching,
            tableTitle: 'ICTL (Individual Critical Task List)',
          }}
          filterType="ctl"
        />
      )}
    </>
  );
};

export default CriticalTaskListTab;
