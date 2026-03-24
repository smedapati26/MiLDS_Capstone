import { useEffect, useState } from 'react';

import { useSnackbar } from '@context/SnackbarProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { Column, PmxTable } from '@components/PmxTable';
import { UnitSelect } from '@components/UnitSelect';
import { currentPermissionsColumn, requestPermissionsColumns } from '@pages/constants';
import { IUnitBrief, useGetUnitsQuery } from '@store/amap_ai/units';
import {
  IUserPermission,
  IUserRequestedPermissions,
  useCreatePermissionRequestMutation,
  useDeletePermissionRequestMutation,
  useLazyGetMyPermissionsQuery,
  useLazyGetMyRequestedPermissionsQuery,
} from '@store/amap_ai/user_request';
import { useAppSelector } from '@store/hooks';

type RoleType = 'viewer' | 'manager' | 'recorder';

export const UserPermissionsTabs = () => {
  const theme = useTheme();
  const { appUser } = useAppSelector((state) => state.appSettings);
  const { showAlert } = useSnackbar();
  const { data: units, isSuccess } = useGetUnitsQuery({ role: undefined });

  const [tab, setTab] = useState<number>(0);
  const [unit, setUnit] = useState<IUnitBrief | undefined>();
  const [role, setRole] = useState<RoleType>('viewer');

  const [fetchMyPermissions, { data: myPermissions, isLoading: loadingPermissions }] = useLazyGetMyPermissionsQuery();

  const [fetchMyRequestedPermissions, { data: myRequestedPermissions, isLoading: loadingRequestedPermissions }] =
    useLazyGetMyRequestedPermissionsQuery();

  const [deletePermissionRequest] = useDeletePermissionRequestMutation();

  useEffect(() => {
    if (tab === 0) {
      fetchMyPermissions();
    } else if (tab === 1) {
      fetchMyRequestedPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const [createPermissionRequest, { isLoading }] = useCreatePermissionRequestMutation();

  const handleSubmit = async () => {
    if (!unit || !appUser) return;

    try {
      await createPermissionRequest({
        user_id: appUser.userId,
        unit_id: unit.uic,
        role,
      })
        .then(() => {
          showAlert(`Your request for ${unit.displayName} (${role}) has been submitted.`, 'success', true);
        })
        .finally(() => {
          setUnit(undefined);
          fetchMyRequestedPermissions();
        });
    } catch {
      showAlert('An error occurred while submitting your permission request', 'error', false);
    }
  };

  const handleDelete = async (row: IUserRequestedPermissions) => {
    try {
      await deletePermissionRequest({ request_id: row.requestId })
        .then(() => {
          showAlert('Permission request deleted.', 'success', true);
        })
        .finally(() => {
          fetchMyRequestedPermissions();
        });
    } catch {
      showAlert('Failed to delete permission request.', 'error', false);
    }
  };

  const requestColumnsWithActions = [
    ...requestPermissionsColumns,
    {
      field: 'actions' as const,
      header: 'Actions',
      width: 150,
      renderCell: (_value, row) => (
        <IconButton color="primary" aria-label="delete" onClick={() => handleDelete(row)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ] as Column<IUserRequestedPermissions>[];

  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 350px)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { width: 0, height: 0 },
        '&:hover': { scrollbarWidth: 'thin' },
        '&:hover::-webkit-scrollbar': { width: '8px', height: '8px' },
        '&:hover::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" pb={2}>
        <Typography variant="h6">User Permissions</Typography>
      </Stack>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Current" />

        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">Requests</Typography>

              <Badge
                color="primary"
                badgeContent={myRequestedPermissions?.length ?? 0}
                sx={{
                  '& .MuiBadge-badge': {
                    right: -12,
                    top: 0,
                  },
                }}
              />
            </Box>
          }
          sx={{
            overflow: 'visible',
            '& .MuiTab-wrapper': {
              fontSize: 'inherit',
            },
          }}
        />
      </Tabs>

      {tab === 0 && (
        <PmxTable
          columns={currentPermissionsColumn as Column<IUserPermission>[]}
          data={myPermissions ?? []}
          getRowId={(row) => `${row.unit}-${row.permission}`}
          isLoading={loadingPermissions}
        />
      )}

      {tab === 1 && (
        <Grid container spacing={4}>
          <Grid size={{ md: 4.2 }}>
            <Paper sx={{ borderRadius: 1, p: 3, background: theme.palette.layout.background5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Request elevated permissions for a unit.
                </Typography>

                <Button variant="outlined" disabled={!unit || isLoading} onClick={handleSubmit}>
                  REQUEST
                </Button>
              </Stack>

              <Stack direction="row" spacing={3}>
                <Box sx={{ width: '382px' }}>
                  <UnitSelect units={isSuccess ? units : []} value={unit} onChange={setUnit} width="382px" />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ pl: 4 }} />

                <Box sx={{ pl: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} pb={1}>
                    <Typography variant="subtitle2">Role*</Typography>
                    <Tooltip
                      title={
                        <>
                          <Typography sx={{ mb: 2 }}>Viewers can only view information of their own units.</Typography>
                          <Typography sx={{ mb: 2 }}>
                            Recorders can write and edit events and documents within their unit.
                          </Typography>
                          <Typography>Managers can edit data within their unit.</Typography>
                        </>
                      }
                    >
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <RadioGroup value={role} onChange={(e) => setRole(e.target.value as RoleType)}>
                    <FormControlLabel value="viewer" control={<Radio />} label="Viewer" />
                    <FormControlLabel value="recorder" control={<Radio />} label="Recorder" />
                    <FormControlLabel value="manager" control={<Radio />} label="Manager" />
                  </RadioGroup>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ md: 12 }}>
            <PmxTable
              columns={requestColumnsWithActions}
              data={myRequestedPermissions ?? []}
              getRowId={(row) => row.requestId}
              isLoading={loadingRequestedPermissions}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};
