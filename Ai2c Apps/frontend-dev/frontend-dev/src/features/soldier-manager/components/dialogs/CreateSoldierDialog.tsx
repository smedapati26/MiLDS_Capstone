import React, { useState } from 'react';
import { rankOptions } from 'src/staticData/rankOptions';

import { useSnackbar } from '@context/SnackbarProvider';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { Grid } from '@mui/material';
import { TableBody } from '@mui/material';

import {
  useCreateSoldierMutation,
  useLazySoldierExistsQuery,
} from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { useSubmitTransferMutation } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';

export interface ICreateSoldierDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  managedUnits: IUnitBrief[];
}

interface ICreateSoldierDialogForm {
  firstName: string | undefined;
  lastName: string | undefined;
  rank: string | undefined;
  unit: string | undefined;
  isMaintainer: boolean;
}

const defaultFormData: ICreateSoldierDialogForm = {
  firstName: undefined,
  lastName: undefined,
  rank: undefined,
  unit: undefined,
  isMaintainer: false,
};

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 225,
    },
  },
};

export const CreateSoldierDialog: React.FC<ICreateSoldierDialogProps> = ({ open, setOpen, managedUnits }) => {
  const theme = useTheme();
  const { showAlert } = useSnackbar();
  const [soldierDoDId, setSoldierDoDId] = useState<string>('');
  const [formData, setFormData] = useState<ICreateSoldierDialogForm>(defaultFormData);
  const [soldierRoles, setSoldierRoles] = useState<{ unit_uic: string; role: string }[]>([]);
  const [soldierRolePage, setSoldierRolePage] = useState<number>(0);
  const [soldierRoleRowsPerPage, setSoldierRoleRowsPerPage] = useState<number>(5);
  const [userExists, setUserExists] = useState<boolean | undefined>(undefined);
  const [checkUserExist] = useLazySoldierExistsQuery();
  const [transferUnit, setTransferUnit] = useState<IUnitBrief | undefined>(
    managedUnits.length > 0 ? managedUnits[0] : undefined,
  );

  const [getUser, { data: existingUser }] = useLazyGetUserQuery();
  const [createUser] = useCreateSoldierMutation();
  const [submitTransferRequest] = useSubmitTransferMutation();

  const handleContinuePress = async () => {
    const userAlreadyExists = await checkUserExist({ soldierId: soldierDoDId }).unwrap();

    setUserExists(userAlreadyExists);

    if (userAlreadyExists) {
      getUser({ userId: soldierDoDId });
    }
  };

  const handleCreate = async () => {
    if (canCreate) {
      await createUser({
        first_name: formData.firstName!,
        last_name: formData.lastName!,
        rank: formData.rank!,
        unit_uic: formData.unit!,
        dod_id: soldierDoDId,
        roles: soldierRoles,
        is_maintainer: formData.isMaintainer,
      }).then(() => {
        showAlert(`Soldier ${formData.firstName} ${formData.lastName} created.`, 'success');
        handleClose();
      });
    }
  };

  const handleClose = () => {
    setSoldierDoDId('');
    setUserExists(undefined);
    setFormData(defaultFormData);
    setSoldierRoles([]);
    setSoldierRolePage(0);
    setSoldierRoleRowsPerPage(5);
    setOpen(false);
  };

  const handleTransferRequest = () => {
    if (transferUnit) {
      submitTransferRequest({
        soldier_ids: [soldierDoDId],
        gaining_uic: transferUnit.uic,
      });
    }
  };

  const canCreate =
    formData.firstName !== undefined &&
    formData.firstName.length > 0 &&
    formData.lastName !== undefined &&
    formData.lastName.length > 0 &&
    formData.rank !== undefined &&
    formData.unit !== undefined;

  const visibleSoldierRoles = soldierRoles.slice(
    soldierRolePage * soldierRoleRowsPerPage,
    soldierRolePage * soldierRoleRowsPerPage + soldierRoleRowsPerPage,
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={userExists === false ? 'md' : 'xs'} fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Create Soldier</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>Enter soldier&apos;s DoD ID number.</Typography>
        <TextField
          disabled={userExists === false}
          error={userExists}
          fullWidth
          helperText={userExists ? 'DoD ID number assigned to an existing user.' : ''}
          sx={{ my: 4 }}
          value={soldierDoDId}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSoldierDoDId(event.target.value)}
          label={'DoD ID'}
          required
        />

        {userExists === false && (
          <Box>
            <Grid container spacing={4}>
              <Grid size={{ xs: 5 }}>
                <TextField
                  label="First Name"
                  required
                  fullWidth
                  value={formData.firstName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <TextField
                  label="Last Name"
                  required
                  fullWidth
                  value={formData.lastName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="create-select-rank-label">Rank</InputLabel>
                  <Select
                    labelId="create-select-rank-label"
                    label="Rank"
                    value={formData.rank}
                    onChange={(e: SelectChangeEvent) => {
                      setFormData((prev) => ({ ...prev, rank: e.target.value as string }));
                    }}
                    MenuProps={MenuProps}
                  >
                    {rankOptions.map((rank) => (
                      <MenuItem key={rank.value} value={rank.value}>
                        {rank.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isMaintainer}
                      onChange={() => setFormData((prev) => ({ ...prev, isMaintainer: !prev.isMaintainer }))}
                      sx={{ mr: 2 }}
                    />
                  }
                  label="Mark as a maintainer"
                  sx={{ pl: 2, pt: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ pb: 4 }}>Select a home unit for this soldier.</Typography>
                <FormControl fullWidth>
                  <InputLabel id="create-select-unit-label">Current Unit</InputLabel>
                  <Select
                    labelId="create-select-unit-label"
                    id="create-select-unit"
                    value={formData.unit}
                    label="Select Unit"
                    required
                    onChange={(e: SelectChangeEvent) => {
                      setFormData((prev) => ({ ...prev, unit: e.target.value as string }));
                    }}
                    MenuProps={MenuProps}
                  >
                    {managedUnits.map((unit) => (
                      <MenuItem key={unit.uic} value={unit.uic}>
                        {unit.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ pb: 4 }}>Add elevated unit roles to this soldier.</Typography>
                <Button
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    color: theme.palette.text.primary,
                  }}
                  onClick={() => setSoldierRoles((prev) => [...prev, { role: '', unit_uic: '' }])}
                >
                  <AddIcon />
                  Add Role
                </Button>

                <Box
                  sx={{
                    my: 2,
                    borderWidth: '2px',
                    borderColor: theme.palette.divider,
                    borderStyle: 'solid',
                    borderRadius: '4px',
                  }}
                >
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="40%">Unit</TableCell>
                          <TableCell width="50%">Elevated Role</TableCell>
                          <TableCell width="10%">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {soldierRoles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              Click &apos;Add Role&apos; to add elevated roles to this soldier.
                            </TableCell>
                          </TableRow>
                        )}

                        {visibleSoldierRoles.map((role, roleIndex) => (
                          <TableRow key={roleIndex}>
                            <TableCell>
                              <Select
                                variant="standard"
                                fullWidth
                                id={`${roleIndex}-role-unit-select`}
                                value={role.unit_uic}
                                required
                                onChange={(e: SelectChangeEvent) =>
                                  setSoldierRoles((prev) =>
                                    // eslint-disable-next-line sonarjs/no-nested-functions
                                    prev.map((role, i) =>
                                      roleIndex + soldierRoleRowsPerPage * soldierRolePage === i && e.target.value
                                        ? { unit_uic: e.target.value, role: role.role }
                                        : role,
                                    ),
                                  )
                                }
                                MenuProps={MenuProps}
                              >
                                {managedUnits.map((unit) => (
                                  <MenuItem key={unit.uic} value={unit.uic}>
                                    {unit.displayName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <ToggleButtonGroup
                                exclusive
                                size="small"
                                fullWidth
                                value={role.role}
                                onChange={(_event: React.MouseEvent<HTMLElement>, newRole: string | null) =>
                                  setSoldierRoles((prev) =>
                                    // eslint-disable-next-line sonarjs/no-nested-functions
                                    prev.map((role, i) =>
                                      roleIndex + soldierRoleRowsPerPage * soldierRolePage === i && newRole
                                        ? { unit_uic: role.unit_uic, role: newRole }
                                        : role,
                                    ),
                                  )
                                }
                              >
                                <ToggleButton value="Manager">Manager</ToggleButton>
                                <ToggleButton value="Recorder">Recorder</ToggleButton>
                                <ToggleButton value="Viewer">Viewer</ToggleButton>
                              </ToggleButtonGroup>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() =>
                                  setSoldierRoles((prev) =>
                                    prev.filter(
                                      // eslint-disable-next-line sonarjs/no-nested-functions
                                      (_role, i) => roleIndex + soldierRoleRowsPerPage * soldierRolePage !== i,
                                    ),
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    aria-label="Soldier Roles Table"
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={soldierRoles.length}
                    rowsPerPage={soldierRoleRowsPerPage}
                    page={soldierRolePage}
                    onPageChange={(_event: unknown, newPage: number) => {
                      setSoldierRolePage(newPage);
                    }}
                    onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSoldierRoleRowsPerPage(parseInt(event.target.value, 10));
                      setSoldierRolePage(0);
                    }}
                    sx={{
                      borderWidth: '2px 0px 0px 0px',
                      borderColor: theme.palette.divider,
                      borderStyle: 'solid',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {userExists && existingUser && (
          <Box>
            <Paper sx={{ p: 4, background: theme.palette.background.paper }}>
              <Typography variant="h6">Existing User Found</Typography>
              <Box sx={{ display: 'flex', spacing: 2, py: 2, gap: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>First Name:</Typography>
                <Typography>{existingUser.firstName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', spacing: 2, py: 2, gap: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>Last Name:</Typography>
                <Typography>{existingUser.lastName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', spacing: 2, py: 2, gap: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>Rank:</Typography>
                <Typography>{existingUser.rank}</Typography>
              </Box>
              <Box sx={{ display: 'flex', spacing: 2, py: 2, gap: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>DoD ID Number:</Typography>
                <Typography>{existingUser.userId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', spacing: 2, py: 2, gap: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>Current Unit:</Typography>
                <Typography>{existingUser.unitName}</Typography>
              </Box>
            </Paper>
            <Typography sx={{ py: 4 }}>Would you like to request a transfer for this soldier?</Typography>
            <FormControl fullWidth>
              <InputLabel id="select-unit-label">Select Unit</InputLabel>
              <Select
                labelId="select-unit-label"
                id="select-unit"
                value={transferUnit?.uic}
                label="Select Unit"
                required
                onChange={(e: SelectChangeEvent) => {
                  setTransferUnit(managedUnits.find((unit) => unit.uic === (e.target.value as string)));
                }}
                MenuProps={MenuProps}
              >
                {managedUnits.map((unit) => (
                  <MenuItem key={unit.uic} value={unit.uic}>
                    {unit.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ mb: 2 }}>
        {userExists === true ? (
          <Button
            onClick={() => {
              setUserExists(undefined);
              setSoldierDoDId('');
            }}
            variant="outlined"
          >
            Back
          </Button>
        ) : (
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        )}
        {userExists === undefined && (
          <Button onClick={handleContinuePress} variant="contained">
            Continue
          </Button>
        )}
        {userExists && (
          <Button variant="contained" onClick={handleTransferRequest} disabled={transferUnit === undefined}>
            Request Transfer
          </Button>
        )}
        {userExists === false && (
          <Button onClick={handleCreate} variant="contained" disabled={!canCreate}>
            Create
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
