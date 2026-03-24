import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Button, IconButton, Skeleton, Tooltip } from '@mui/material';
import { Box } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { setEventId } from '@features/amtp-packet/slices';
import {
  SupportingDocument,
  useDeleteSupportinDocumentMutation,
  useLazyGetSupportingDocumentsQuery,
} from '@store/amap_ai/supporting_documents';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { supportingDocumentsCols } from '../../constants';
import PreviewSupportingDocumentDialog from '../counselings/PreviewSupportingDocumentDialog';
import AddSupportingDocumentDialog from '../supporting-documents/AddSupporingDocumentDialog';
import EditSupportingDocumentDialog from '../supporting-documents/EditSupporingDocumentDialog';
import { AmtpTable } from '../tables/AmtpTable';

const SupportingDocumentsTab: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasRole } = useUnitAccess();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [fetchDocuments, { data: { supportingDocuments = [] } = {}, isFetching = false }] =
    useLazyGetSupportingDocumentsQuery();
  const [deleteSupportingDocument] = useDeleteSupportinDocumentMutation();
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<SupportingDocument>();

  const handleCallback = async (value: number) => {
    await dispatch(setEventId(value));
    navigate('/amtp-packet/maintainer-record');
  };

  const getDocuments = () => {
    if (maintainer?.id) {
      fetchDocuments({
        soldier_id: maintainer?.id ?? '1234567890',
        visible_only: true,
      });
    }
  };

  useEffect(() => {
    getDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintainer]);

  const supportingDocumentsColsWithActions = [
    ...supportingDocumentsCols(handleCallback),
    {
      field: '',
      header: 'Actions',
      renderCell: (_val: null, row: SupportingDocument) => {
        return (
          <Box>
            {(hasRole('manager') || hasRole('recorder')) && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="edit"
                    onClick={() => {
                      setSelectedDocument(row);
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
                      setSelectedDocument(row);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <FolderOpenIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    aria-label="delete"
                    onClick={async () => {
                      await deleteSupportingDocument({ id: row.id });
                      getDocuments();
                    }}
                  >
                    <DeleteIcon />
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
    <Box aria-label="Supporting Documents Table">
      {isFetching && <Skeleton data-testid="skeleton-loading" variant="rectangular" width="100%" height="250px" />}

      {supportingDocuments && !isFetching && (
        <AmtpTable
          filterType="supporting_documents"
          tableProps={{
            columns: supportingDocumentsColsWithActions as Column<SupportingDocument>[],
            getRowId: (row) => row.id,
            data: supportingDocuments ?? [],
            isLoading: isFetching,
            tableTitle: 'Soldier Supporting Documents',
            titleBtn: (
              <Box mt={1} mb={1} sx={{ py: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setAddDialogOpen(true)}
                  disabled={!(hasRole('manager') || hasRole('recorder'))}
                >
                  Add Document{' '}
                </Button>
              </Box>
            ),
          }}
        />
      )}
      <AddSupportingDocumentDialog
        key={1}
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
        refetchSupportingDocuments={() => getDocuments()}
      />
      {selectedDocument && (
        <EditSupportingDocumentDialog
          key={selectedDocument.id}
          document={selectedDocument}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          refetchSupportingDocuments={() => getDocuments()}
        />
      )}
      {selectedDocument && (
        <PreviewSupportingDocumentDialog
          key={`file-preview-dialog-${selectedDocument.id}`}
          supportingDocument={selectedDocument}
          open={previewDialogOpen}
          setOpen={setPreviewDialogOpen}
        />
      )}
    </Box>
  );
};

export default SupportingDocumentsTab;
