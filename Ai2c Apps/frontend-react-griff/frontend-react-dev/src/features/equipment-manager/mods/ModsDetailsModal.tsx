import React, { useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Checkbox, Modal, Paper, Snackbar, Stack, Typography, useTheme } from '@mui/material';

import { EnumOption, SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, OrStatusTableCell, PmxCommentTooltip, PmxTable } from '@components/data-tables';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import {
  IModification,
  IModificationColumnMapping,
  MODIFICATION_DETAIL_COLUMNS,
  TrackingVariableOptions,
} from '@store/griffin_api/mods/models';
import { useDeleteModificationMutation } from '@store/griffin_api/mods/slices';

import ModsMultiEdit from './ModsMultiEdit';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  model: string;
  data: IModification[] | undefined;
  isLoading: boolean;
}

/**
 * Generate the columns to be dynamic for each table in accordion
 * @param columns
 * @returns
 */
const generateDynamicColumns = (): IModificationColumnMapping[] => {
  // rendering columns based no headers
  return MODIFICATION_DETAIL_COLUMNS.filter((column) => column.key !== 'location').map((column) => ({
    ...column,
    render: (
      value: IModification[keyof IModification], // value based on a key
      row: IModification, // whole row
    ) => {
      const { key } = column;

      switch (key) {
        case 'serialNumber':
          return !value || value === '' ? '—' : value;
        case 'assignedAircraft':
          return !value || value === '' ? '—' : value;
        case 'trackingVariable':
          if (value === TrackingVariableOptions.STATUS.value) {
            return TrackingVariableOptions.STATUS.shortLabel;
          } else {
            return Object.values(TrackingVariableOptions).find((opt) => opt.value === value)?.label;
          }
        case 'value':
          if (value && Object.keys(OperationalReadinessStatusEnum).includes(value as string)) {
            return <OrStatusTableCell status={value as string} />;
          } else {
            return !value || (value as string).trim() === '' ? '—' : value;
          }
        case 'location':
          return row.location?.code ?? '—';
        case 'remarks':
          return (
            <PmxCommentTooltip
              title={
                <Stack direction="column" spacing={4}>
                  <Typography variant="body2">Remarks</Typography>
                  <Typography variant="body1">{value as string}</Typography>
                </Stack>
              }
            />
          );
        default:
          return value ?? '—';
      }
    },
  }));
};

/**
 * Multi edit of an aircraft equipment.
 * @returns React.Node
 */

const ModsDetailsModal = (props: Props): React.ReactNode => {
  const { open, setOpen, model, data, isLoading } = props;
  const theme = useTheme();
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [editModIds, setEditModIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteModification] = useDeleteModificationMutation();

  const handleClose = () => {
    setOpen(false);
    setEditModIds([]);
  };

  const handleEdit = () => {
    if (editModIds.length > 0) {
      setOpenEditModal(true);
    }
  };

  const handleEditSave = () => {
    setOpen(false);
    setEditModIds([]);
    setShowSnackbar(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDelete = async (modId: number) => {
    try {
      await deleteModification({ modId: modId.toString() }).unwrap();

      if (editModIds.includes(modId)) {
        setEditModIds((prev) => prev.filter((mod) => mod != modId));
      }
    } catch (error) {
      console.error('Error deleting modification: ', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectRow = (modId: number) => {
    if (editModIds.includes(modId)) {
      setEditModIds((prev) => prev.filter((mod) => mod != modId));
    } else {
      setEditModIds((prev) => [...prev, modId]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectAll = () => {
    if (!data || data.length == 0) return;

    if (editModIds.length === data.length) {
      setEditModIds([]);
    } else {
      setEditModIds(data.map((mod) => mod.id));
    }
  };

  const handleSearch = (_event: React.SyntheticEvent, value: EnumOption) => {
    setSearchQuery(value as unknown as string);
  };

  const editData: IModification[] | undefined = useMemo(() => {
    if (!data || editModIds.length === 0) {
      return undefined; // Return undefined
    }

    return data.filter((mod: IModification) => editModIds.includes(mod.id));
  }, [data, editModIds]);

  const editModSerials: string[] | undefined = useMemo(() => {
    return editData?.map((mod) => mod.serialNumber);
  }, [editData]);

  const filteredData: IModification[] | undefined = useMemo(() => {
    if (searchQuery) {
      return data?.filter((item) => {
        return Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    return data;
  }, [data, searchQuery]);

  const columns: ColumnConfig<IModification>[] = useMemo(() => {
    return generateDynamicColumns() as ColumnConfig<IModification>[];
  }, []);

  const selectableColumns: ColumnConfig<IModification>[] = useMemo(() => {
    return [
      {
        label: '',
        key: 'checkbox',
        width: '10%',
        render: (_: IModification, rowData: IModification) => {
          return (
            <Checkbox
              checked={editModIds.includes(rowData['id'])}
              onChange={() => handleSelectRow(rowData['id'])}
              data-testid={`mod-checkbox-${rowData['id']}`}
            />
          );
        },
        renderHeader: () => {
          return (
            <Checkbox
              checked={data && data?.length > 0 && editModIds.length === data?.length}
              indeterminate={data && data.length > 0 && editModIds.length > 0 && editModIds.length < data.length}
              onChange={() => handleSelectAll()}
              onClick={(event) => event.stopPropagation()}
              data-testid={'mod-checkbox-all'}
            />
          );
        },
      } as unknown as ColumnConfig<IModification>,
      ...columns,
      {
        label: 'Actions',
        key: 'actions',
        width: '10%',
        render: (_: IModification, row: IModification) => {
          return (
            <Button onClick={() => handleDelete(row.id)}>
              <DeleteIcon fontSize="small" sx={{ color: (theme) => theme.palette.text.primary }} />
            </Button>
          );
        },
      } as unknown as ColumnConfig<IModification>,
    ];
  }, [columns, data, editModIds, handleDelete, handleSelectAll, handleSelectRow]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          width: '83%',
          padding: '20px 16px',
          margin: 'auto',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">{model.replace(/_/g, ' ')} Details</Typography>
            <Button onClick={handleClose} sx={{ color: theme.palette.text.primary }}>
              <CloseIcon fontSize="small" data-testid="close-mods-details" />
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Button startIcon={<EditIcon />} variant="contained" onClick={handleEdit} data-testid="edit-mods-details">
              Edit
            </Button>
            <SearchBar
              options={[]}
              variant="standard"
              color="default"
              onChange={(_event, value) => handleSearch(_event, value)}
              styles={{ minWidth: '200px', width: '25%' }}
            />
          </Stack>
          <PmxTable
            isLoading={isLoading}
            columns={selectableColumns}
            rows={filteredData ?? []}
            paginate={true}
            sx={{ height: '70vh' }}
            size={'small'}
          />
        </Stack>
        {editData && (
          <ModsMultiEdit
            open={openEditModal}
            setOpen={setOpenEditModal}
            columns={columns}
            rows={editData}
            modelType={model}
            handleEditSave={handleEditSave}
          />
        )}
        <Snackbar
          data-testid={'mods-edit-undo-snackbar'}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          onClose={() => setShowSnackbar(false)}
          sx={{ marginTop: '75px', backgroundColor: theme.palette.layout?.background11 }}
          message={editModSerials ? `${editModSerials.join(', ')} information updated.` : undefined}
          autoHideDuration={4000}
        />
      </Paper>
    </Modal>
  );
};

export default ModsDetailsModal;
