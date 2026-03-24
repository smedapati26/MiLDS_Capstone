import React, { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { Table } from '@mui/material';
import { Grid } from '@mui/material';
import { Radio } from '@mui/material';
import { Tooltip } from '@mui/material';

import PmxDatePicker from '@components/PmxDatePicker';
import PmxFileUploader from '@components/PmxFileUploader';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import {
  useCreateDesignationMutation,
  useDeleteDesignationMutation,
  useGetAllDesignationsQuery,
} from '@store/amap_ai/designation';
import { ICreateSoldierDesignationDTO } from '@store/amap_ai/designation/models';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { useUpdateSoldierMutation } from '@store/amap_ai/soldier/slices/soldierApi';
import { IUnitSoldierFlag, useLazyGetSoldierInfoQuery } from '@store/amap_ai/soldier_manager';
import { useLazyGetSupportingDocumentsQuery } from '@store/amap_ai/supporting_documents';
import { IUnitBrief } from '@store/amap_ai/units/models';
import {
  useCreateSoldierRoleMutation,
  useDeleteSoldierRoleMutation,
  useUpdateSoldierRoleMutation,
} from '@store/amap_ai/user_role/slices/userRoleApiSlice';
import { StatusType } from '@utils/constants';

export interface IEditSoldierDialog {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  soldier: IUnitSoldierFlag;
  managedUnits: IUnitBrief[];
}

interface ICreateDesignationForm {
  unit_uic: string;
  designation: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
  docSource: string;
  supportDocId: number | null;
}

const defaultICreateDesignationForm: ICreateDesignationForm = {
  unit_uic: '',
  designation: '',
  startDate: null,
  endDate: null,
  noEndDate: false,
  docSource: 'existingDoc',
  supportDocId: null,
};

export const EditSoldierDialog: React.FC<IEditSoldierDialog> = ({ open, setOpen, soldier, managedUnits }) => {
  const theme = useTheme();
  const [getSoldierInfo, { data: soldierInfo }] = useLazyGetSoldierInfoQuery();
  const [markAsMaintainer, setMarkAsMaintainer] = useState<boolean>(false);
  const [soldierPrimaryMos, setSoldierPrimaryMos] = useState<string>('');
  const [soldierAdditionalMos, setSoldierAdditionalMos] = useState<string[]>([]);
  const { data: allMOS } = useGetAllMOSQuery();
  const [tablePage, setTablePage] = useState<number>(0);
  const [tableRowsPerPage, setTableRowsPerPage] = useState<number>(10);
  const [newRoleForm, setNewRoleForm] = useState<{ unit: string; role: string } | null>(null);
  const [newDesignationForm, setNewDesignationForm] = useState<ICreateDesignationForm | null>(null);
  const [newDesignationFile, setNewDesignationFile] = useState<File | null>(null);
  const [createUserRole] = useCreateSoldierRoleMutation();
  const { data: designations } = useGetAllDesignationsQuery();
  const [fetchSupportingDocuments, { data: supportingDocuments }] = useLazyGetSupportingDocumentsQuery();
  const [supportDocPage, setSupportDocPage] = useState<number>(0);
  const [deleteDesignation] = useDeleteDesignationMutation();
  const [updateSoldierRole] = useUpdateSoldierRoleMutation();
  const [deleteSoldierRole] = useDeleteSoldierRoleMutation();
  const [createDesignation] = useCreateDesignationMutation();
  const [updateSoldier] = useUpdateSoldierMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const displaySuccessUtil = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  useEffect(() => {
    getSoldierInfo(soldier.dodId);
    fetchSupportingDocuments({ soldier_id: soldier.dodId, visible_only: true });
  }, [soldier, getSoldierInfo, fetchSupportingDocuments]);

  useEffect(() => {
    if (soldierInfo) {
      setMarkAsMaintainer(soldierInfo.isMaintainer);
      setSoldierPrimaryMos(soldierInfo.primaryMos);
      setSoldierAdditionalMos(soldierInfo.additionalMos);
    }
  }, [soldierInfo]);

  const handleUpdateMarkAsMaintainer = async () => {
    const newMarkAsMaintainer = !markAsMaintainer;
    await updateSoldier({ user_id: soldier.dodId, is_maintainer: newMarkAsMaintainer });

    setMarkAsMaintainer(newMarkAsMaintainer);
  };

  const handleCreateRole = async () => {
    if (canCreateRole) {
      await createUserRole({
        soldier_id: soldier.dodId,
        unit_uic: newRoleForm.unit,
        role: newRoleForm.role,
      }).then(() => {
        displaySuccessUtil();
        getSoldierInfo(soldier.dodId);
        setNewRoleForm(null);
      });
    }
  };

  const visibleSupportingDocs =
    supportingDocuments?.supportingDocuments.slice(supportDocPage * 5, supportDocPage * 5 + 5) ?? [];

  const handleChangeRole = async (roleId: number | undefined, newRole: string, unitUic: string) => {
    setLoading(true);
    if (roleId) {
      await updateSoldierRole({ roleId, creationData: { role: newRole } }).then(() => {
        displaySuccessUtil();
        getSoldierInfo(soldier.dodId);
      });
    } else {
      await createUserRole({
        soldier_id: soldier.dodId,
        unit_uic: unitUic,
        role: newRole,
      }).then(() => {
        displaySuccessUtil();
        getSoldierInfo(soldier.dodId);
        setNewRoleForm(null);
      });
    }
    setLoading(false);
  };

  const handleMOSUpdate = async (primary_mos?: string, additional_mos?: string[]) => {
    setLoading(true);
    if (primary_mos) {
      setSoldierPrimaryMos(primary_mos);
      const new_additional_mos = soldierAdditionalMos.filter((mos) => mos !== primary_mos);
      setSoldierAdditionalMos(new_additional_mos);
      await updateSoldier({
        user_id: soldier.dodId,
        primary_mos: primary_mos,
        additional_mos: new_additional_mos,
      }).then(() => displaySuccessUtil());
    }
    if (additional_mos) {
      setSoldierAdditionalMos(additional_mos);
      await updateSoldier({ user_id: soldier.dodId, additional_mos }).then(() => displaySuccessUtil());
    }
    setLoading(false);
  };

  const handleDeleteDesignation = async (designationId: number) => {
    setLoading(true);
    await deleteDesignation(designationId).then(() => {
      displaySuccessUtil();
      getSoldierInfo(soldier.dodId);
    });
    setLoading(false);
  };

  const handleDeleteRole = async (roleId: number) => {
    setLoading(true);
    await deleteSoldierRole(roleId).then(() => {
      displaySuccessUtil();
      getSoldierInfo(soldier.dodId);
    });
    setLoading(false);
  };

  const handleCreateDesignation = async () => {
    setLoading(true);
    if (canCreateDesignation) {
      let creationData: { data: ICreateSoldierDesignationDTO; file: File | null } = {
        data: {
          designation: newDesignationForm.designation,
          document_type: '',
          start_date: newDesignationForm.startDate!.format('YYYY-MM-DD'),
          soldier_id: soldier.dodId,
          unit_uic: newDesignationForm.unit_uic,
        },
        file: null,
      };

      if (!newDesignationForm.noEndDate && newDesignationForm.endDate?.isValid) {
        creationData = {
          data: { ...creationData.data, end_date: newDesignationForm.endDate.format('YYYY-MM-DD') },
          file: null,
        };
      }

      if (newDesignationFile && newDesignationForm.docSource === 'newDoc') {
        creationData = { ...creationData, file: newDesignationFile };
      }

      if (newDesignationForm.docSource === 'existingDoc' && newDesignationForm.supportDocId !== null) {
        creationData = {
          data: { ...creationData.data, supporting_document_id: newDesignationForm.supportDocId },
          file: null,
        };
      }

      await createDesignation(creationData).then(() => {
        displaySuccessUtil();
        getSoldierInfo(soldier.dodId);
        setNewDesignationForm(null);
      });
    }
    setLoading(false);
  };

  const canCreateRole = newRoleForm && newRoleForm.role.length > 0 && newRoleForm.unit.length > 0;
  const canCreateDesignation =
    newDesignationForm &&
    (newDesignationFile || newDesignationForm.supportDocId !== null) &&
    newDesignationForm.unit_uic.length > 0 &&
    newDesignationForm.designation.length > 0 &&
    newDesignationForm.startDate &&
    newDesignationForm.startDate.isValid() &&
    ((newDesignationForm.endDate && newDesignationForm.endDate.isValid()) || newDesignationForm.noEndDate);

  return (
    <Dialog maxWidth="md" fullWidth open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Edit Soldier</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 4, background: theme.palette.layout.background5 }}>
          <Typography variant="h6" sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: 4 }} noWrap>
            {soldier.name}
            <StatusDisplay
              iconOnly
              status={
                soldier.mxAvailability === 'Available'
                  ? soldier.mxAvailability
                  : (`Flagged - ${soldier.mxAvailability}` as StatusType)
              }
            />
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, pt: 4, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>Rank:</Typography>
              <Typography>{soldier.rank}</Typography>
            </Box>
            <Divider orientation="vertical" sx={{ height: '20px' }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>DoD ID:</Typography>
              <Typography>{soldier.dodId}</Typography>
            </Box>
            <Divider orientation="vertical" sx={{ height: '20px' }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>Current Unit:</Typography>
              <Typography>{soldier.unit}</Typography>
            </Box>
          </Box>
        </Paper>
        <FormControlLabel
          control={<Checkbox checked={markAsMaintainer} onChange={handleUpdateMarkAsMaintainer} sx={{ mr: 2 }} />}
          label="Mark as a maintainer"
          sx={{ pl: 2, pt: 2 }}
        />
        <Typography sx={{ py: 4 }} variant="body2">
          MOS
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <FormControl fullWidth sx={{ width: '45%', height: '65', minHeight: '65' }} required>
            <InputLabel id="primary-mos-input-label">Primary MOS</InputLabel>
            <Select
              labelId="primary-mos-input-label"
              value={soldierPrimaryMos}
              label="Primary MOS"
              onChange={(e: SelectChangeEvent) => handleMOSUpdate(e.target.value as string)}
            >
              {allMOS?.map((mos) => (
                <MenuItem key={mos.mos} value={mos.mos}>
                  {mos.mos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ height: '65', minHeight: '65' }}>
            <InputLabel id="additional-mos-input-label">Additional MOS</InputLabel>
            <Select<string[]>
              labelId="additional-mos-input-label"
              value={soldierAdditionalMos}
              label="Additional MOS"
              multiple
              onChange={(event) => handleMOSUpdate(undefined, event.target.value as string[])}
              renderValue={(values: string[]) => (
                <Box sx={{ display: 'flex', gap: 0.5, my: -1.25 }}>
                  {values.slice(0, 4).map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      deleteIcon={<CloseIcon onMouseDown={(e) => e.stopPropagation()} />}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDelete={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        handleMOSUpdate(
                          undefined,
                          // eslint-disable-next-line sonarjs/no-nested-functions
                          soldierAdditionalMos.filter((mos) => mos !== value),
                        );
                      }}
                    />
                  ))}
                  {values.length > 3 && <Chip label={`+${values.length - 3}`} />}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: '350px' },
                },
              }}
            >
              <MenuItem
                disableRipple
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  mb: 1,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  setSoldierAdditionalMos((prev) =>
                    prev.length > 0
                      ? []
                      : (allMOS?.filter((mos) => mos.mos !== soldierPrimaryMos).map((mos) => mos.mos) ?? []),
                  );
                }}
              >
                <Checkbox
                  checked={allMOS ? soldierAdditionalMos.length === allMOS.length - 1 : false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setSoldierAdditionalMos((prev) =>
                      prev.length > 0
                        ? []
                        : (allMOS?.filter((mos) => mos.mos !== soldierPrimaryMos).map((mos) => mos.mos) ?? []),
                    );
                  }}
                />
                <ListItemText
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setSoldierAdditionalMos((prev) =>
                      prev.length > 0
                        ? []
                        : (allMOS?.filter((mos) => mos.mos !== soldierPrimaryMos).map((mos) => mos.mos) ?? []),
                    );
                  }}
                >
                  Select / Unselect All
                </ListItemText>
              </MenuItem>
              {allMOS?.map((mos) => (
                <MenuItem key={mos.mos} value={mos.mos} disabled={mos.mos === soldierPrimaryMos}>
                  <Checkbox checked={soldierAdditionalMos.includes(mos.mos)} />
                  {mos.mos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography sx={{ pt: 4, pb: 2 }} variant="body2">
          Roles and Designations
        </Typography>
        <Box sx={{ display: 'flex', ml: -3 }}>
          <Button
            onClick={() => setNewRoleForm({ unit: '', role: '' })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: theme.palette.text.primary,
            }}
            disabled={newRoleForm !== null || newDesignationForm !== null}
          >
            <AddIcon />
            Add Role
          </Button>
          <Button
            onClick={() => setNewDesignationForm(defaultICreateDesignationForm)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: theme.palette.text.primary,
            }}
            disabled={newRoleForm !== null || newDesignationForm !== null}
          >
            <AddIcon />
            Add Designation
          </Button>
        </Box>
        {newRoleForm && (
          <Paper sx={{ p: 4, mb: 4, backgroundColor: theme.palette.layout.background5 }}>
            <Typography variant="body2" sx={{ pb: 2 }}>
              Add a Role
            </Typography>
            <Typography variant="body3">Select a unit and role level to grant this user.</Typography>
            <FormControl fullWidth required size="small" sx={{ mt: 4, mb: 2 }}>
              <InputLabel id="new-role-unit-select-label">Unit</InputLabel>
              <Select
                labelId="new-role-unit-select-label"
                value={newRoleForm.unit}
                label="Unit"
                required
                onChange={(e) => setNewRoleForm((prev) => (prev ? { ...prev, unit: e.target.value as string } : null))}
              >
                {managedUnits
                  .filter(
                    (unit) =>
                      !soldierInfo?.unitRolesAndDesignations.flatMap((unitRole) => unitRole.unitUic).includes(unit.uic),
                  )
                  .map((unit) => (
                    <MenuItem key={unit.uic} value={unit.uic}>
                      {unit.displayName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required size="small" sx={{ my: 2 }}>
              <InputLabel id="new-role-role-select-label">Role</InputLabel>
              <Select
                labelId="new-role-role-select-label"
                value={newRoleForm.role}
                label="Role"
                required
                onChange={(e) => setNewRoleForm((prev) => (prev ? { ...prev, role: e.target.value as string } : null))}
              >
                {['Manager', 'Viewer', 'Recorder'].map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => setNewRoleForm(null)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleCreateRole} disabled={!canCreateRole}>
                Add
              </Button>
            </Box>
          </Paper>
        )}
        {newDesignationForm && (
          <Paper sx={{ p: 4, mb: 4, backgroundColor: theme.palette.layout.background5 }}>
            <Typography variant="body2" sx={{ pb: 2 }}>
              Add a Designation
            </Typography>
            <Typography variant="body3">Select a unit and designation level to assign to this user.</Typography>
            <FormControl fullWidth required size="small" sx={{ mt: 4, mb: 2 }}>
              <InputLabel id="new-role-unit-select-label">Unit</InputLabel>
              <Select
                labelId="new-role-unit-select-label"
                value={newDesignationForm.unit_uic}
                label="Unit"
                required
                onChange={(e) =>
                  setNewDesignationForm((prev) => (prev ? { ...prev, unit_uic: e.target.value as string } : null))
                }
              >
                {managedUnits.map((unit) => (
                  <MenuItem key={unit.uic} value={unit.uic}>
                    {unit.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container sx={{ py: 2 }}>
              <Grid size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControl fullWidth required size="small" sx={{ pr: 4 }}>
                  <InputLabel id="new-designation-designation-select-label">Designation</InputLabel>
                  <Select
                    labelId="new-designation-designation-select-label"
                    value={newDesignationForm.designation}
                    onChange={(e: SelectChangeEvent) => {
                      setNewDesignationForm((prev) =>
                        prev ? { ...prev, designation: e.target.value as string } : null,
                      );
                    }}
                  >
                    {designations?.map((designation) => (
                      <MenuItem key={designation.id} value={designation.type}>
                        {designation.type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider orientation="vertical" sx={{ height: '100%', mr: 4 }} />
              </Grid>
              <Grid size={{ xs: 8 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <PmxDatePicker
                  small
                  label="Start Date"
                  value={newDesignationForm.startDate}
                  onChange={(date: Dayjs | null) =>
                    setNewDesignationForm((prev) => (prev ? { ...prev, startDate: date } : null))
                  }
                  shrinkLabel
                />
                <Typography display="flex" alignItems={'center'} sx={{ px: 2 }}>
                  -
                </Typography>
                <PmxDatePicker
                  small
                  label="End Date"
                  value={newDesignationForm.endDate}
                  onChange={(date: Dayjs | null) =>
                    setNewDesignationForm((prev) => (prev ? { ...prev, endDate: date } : null))
                  }
                  shrinkLabel
                  disabled={newDesignationForm.noEndDate}
                />
                <FormControl sx={{ width: '100%', pl: 4 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={() =>
                          setNewDesignationForm((prev) => (prev ? { ...prev, noEndDate: !prev.noEndDate } : null))
                        }
                      />
                    }
                    label="No End Date"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body3">Select supporting documents to upload.*</Typography>
              <FormControl>
                <RadioGroup
                  value={newDesignationForm.docSource}
                  onChange={(_event: React.ChangeEvent<HTMLInputElement>, value: string) =>
                    setNewDesignationForm((prev) => (prev ? { ...prev, docSource: value } : null))
                  }
                >
                  <FormControlLabel value="existingDoc" control={<Radio />} label="Associate an existing document." />
                  <FormControlLabel value="newDoc" control={<Radio />} label="Upload a new document." />
                </RadioGroup>
              </FormControl>
            </Box>
            {newDesignationForm.docSource === 'existingDoc' && (
              <Box
                sx={{
                  my: 4,
                  borderWidth: '2px',
                  borderColor: theme.palette.divider,
                  borderStyle: 'solid',
                  borderRadius: '4px',
                }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleSupportingDocs.map((supportingDoc) => (
                        <TableRow key={supportingDoc.id}>
                          <TableCell>
                            <Checkbox
                              checked={newDesignationForm.supportDocId === supportingDoc.id}
                              onClick={() =>
                                setNewDesignationForm((prev) =>
                                  prev ? { ...prev, supportDocId: supportingDoc.id } : null,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>{supportingDoc.documentTitle}</TableCell>
                          <TableCell>{supportingDoc.documentType}</TableCell>
                          <TableCell>{supportingDoc.documentDate}</TableCell>
                        </TableRow>
                      ))}
                      {(supportingDocuments === undefined || supportingDocuments.supportingDocuments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4}>There are no supporting documents for this soldier.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  aria-label="Unit Flags Table"
                  rowsPerPageOptions={[5]}
                  count={supportingDocuments?.supportingDocuments?.length ?? 0}
                  rowsPerPage={5}
                  page={supportDocPage}
                  onPageChange={(_event: unknown, newPage: number) => {
                    setSupportDocPage(newPage);
                  }}
                  component="div"
                  sx={{
                    borderWidth: '2px 0px 0px 0px',
                    borderColor: theme.palette.divider,
                    borderStyle: 'solid',
                    minHeight: 32,
                    '.MuiTablePagination-toolbar': {
                      minHeight: 32,
                      height: 32,
                      py: 0.25,
                    },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { my: 0 },
                    '.MuiTablePagination-select': {
                      py: 0.25,
                    },
                  }}
                />
              </Box>
            )}
            {newDesignationForm.docSource === 'newDoc' && (
              <PmxFileUploader attachedFile={newDesignationFile} setAttachedFile={setNewDesignationFile} />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button variant="outlined" onClick={() => setNewDesignationForm(null)}>
                Cancel
              </Button>
              <Button variant="contained" disabled={!canCreateDesignation} onClick={handleCreateDesignation}>
                Add
              </Button>
            </Box>
          </Paper>
        )}
        <Box
          sx={{
            mt: 2,
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
                  <TableCell sx={{ width: '35%' }}>Unit</TableCell>
                  <TableCell sx={{ width: '35%' }}>Elevated Role</TableCell>
                  <TableCell sx={{ width: '30%' }}>Designation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {soldierInfo?.unitRolesAndDesignations.map((unitRoleAndDes) => (
                  <TableRow key={unitRoleAndDes.unitUic}>
                    <TableCell>{unitRoleAndDes.unitName}</TableCell>
                    <TableCell>
                      <Select
                        value={unitRoleAndDes.roleType ?? '--'}
                        variant="standard"
                        fullWidth
                        onChange={(event: SelectChangeEvent<string>) =>
                          handleChangeRole(unitRoleAndDes.roleId, event.target.value as string, unitRoleAndDes.unitUic)
                        }
                        renderValue={(role) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {role}

                            {role && role !== '--' && (
                              <IconButton
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRole(unitRoleAndDes.roleId!);
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      >
                        {['Manager', 'Recorder', 'Viewer'].map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      {unitRoleAndDes.designationType ? (
                        <Button
                          onClick={() =>
                            unitRoleAndDes.designationId ? handleDeleteDesignation(unitRoleAndDes.designationId) : null
                          }
                          variant="outlined"
                          endIcon={
                            <Tooltip
                              placement="top"
                              title="Remove designation from soldier. All supporting document swill be retained in the soldier's AMTP Packet."
                            >
                              <CloseIcon />
                            </Tooltip>
                          }
                          sx={{
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.grey.main,
                            '&:hover': { backgroundColor: 'transparent', borderColor: theme.palette.grey.main },
                          }}
                        >
                          {unitRoleAndDes.designationType}
                        </Button>
                      ) : (
                        '--'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            aria-label="Soldier Unit Roles and Designations Table"
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={soldierInfo?.unitRolesAndDesignations.length ?? 0}
            rowsPerPage={tableRowsPerPage}
            page={tablePage}
            onPageChange={(_event: unknown, newPage: number) => {
              setTablePage(newPage);
            }}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTableRowsPerPage(parseInt(event.target.value, 10));
              setTablePage(0);
            }}
            sx={{
              position: 'static',
              borderWidth: '2px 0px 0px 0px',
              borderColor: theme.palette.divider,
              borderStyle: 'solid',
            }}
          />
        </Box>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, pt: 4 }}>
            <CircularProgress size={'20px'} sx={{ height: '25px !important', width: '25px !important' }} />
            <Typography>Saving...</Typography>
          </Box>
        )}
        {!loading && showSuccess && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, pt: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: '25' }} />
            <Typography>Successfully saved.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ m: 2 }}>
        <Button variant="contained" onClick={() => setOpen(false)}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
