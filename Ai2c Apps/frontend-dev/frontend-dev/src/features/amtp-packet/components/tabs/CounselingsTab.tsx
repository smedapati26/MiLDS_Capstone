import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Box, Button, IconButton, Skeleton, Tooltip } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { counselingCols } from '@features/amtp-packet/constants';
import { setEventId } from '@features/amtp-packet/slices';
import { IDA4856, useGetCounselingsQuery } from '@store/amap_ai/counselings';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import AddCounselingDialog from '../counselings/AddCounselingDialog';
import DownloadAllCounselingDocumentsDialog from '../counselings/DownloadAllCounselingDocumentsDialog';
import EditCounselingDialog from '../counselings/EditCounselingDialog';
import PreviewCounselingDocumentDialog from '../counselings/PreviewCounselingDocumentDialog';
import { AmtpTable } from '../tables/AmtpTable';

const CounselingsTab: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasRole } = useUnitAccess();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [selectedCounseling, setSelectedCounseling] = useState<IDA4856 | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [downloadAllDialogOpen, setDownloadAllDialogOpen] = useState<boolean>(false);
  const {
    data: counselings = [],
    isLoading = false,
    isFetching = false,
    refetch: refetchCounselings,
  } = useGetCounselingsQuery({
    soldier_id: maintainer?.id ?? '1234567890',
  });

  const handleCallback = async (value: number) => {
    await dispatch(setEventId(value));
    navigate('/amtp-packet/maintainer-record');
  };

  const counselingColsWithActions = [
    ...counselingCols(handleCallback),
    {
      field: '',
      header: 'Actions',
      renderCell: (_val: null, row: IDA4856) => {
        return (
          <Box>
            {(hasRole('manager') || hasRole('recorder')) && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setSelectedCounseling(row);
                      setEditDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View">
                  <IconButton
                    aria-label="view"
                    onClick={() => {
                      setSelectedCounseling(row);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <FolderOpenIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box aria-label="Soldier Counselings Table">
      {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

      {counselings && !isFetching && (
        <AmtpTable
          filterType="counselings"
          tableProps={{
            columns: counselingColsWithActions as Column<IDA4856>[],
            getRowId: (row) => row.title,
            data: counselings,
            isLoading: isFetching,
            tableTitle: 'Soldier DA 4856',
            titleBtn: (
              <Box mt={1} mb={1} sx={{ py: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={!(hasRole('manager') || hasRole('recorder'))}
                >
                  Add Counseling{' '}
                </Button>
              </Box>
            ),
            headerDialogs: (
              <Tooltip title="Download All">
                <IconButton onClick={() => setDownloadAllDialogOpen(true)}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
      )}
      <AddCounselingDialog
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
        refetchCounselings={refetchCounselings}
      />
      {selectedCounseling && (
        <EditCounselingDialog
          key={selectedCounseling.id}
          counseling={selectedCounseling}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          refetchCounselings={refetchCounselings}
        />
      )}
      {selectedCounseling && (
        <PreviewCounselingDocumentDialog
          key={`file-preview-dialog-${selectedCounseling.id}`}
          counseling={selectedCounseling}
          open={previewDialogOpen}
          setOpen={setPreviewDialogOpen}
        />
      )}
      <DownloadAllCounselingDocumentsDialog
        counselings={counselings}
        open={downloadAllDialogOpen}
        setOpen={setDownloadAllDialogOpen}
      />
      {isLoading && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="100%" />}
    </Box>
  );
};

export default CounselingsTab;
