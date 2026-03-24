import { useCallback, useState } from 'react';
import { Blocker } from 'react-router-dom';
import { useNavigationBlocker } from 'src/hooks/useNavigationBlocker';

import { ErrorOutline, Info, TaskAlt } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { titlecase } from '@ai2c/pmx-mui';

import { UnitSelect } from '@components/dropdowns/UnitSelect';
import UnsavedChangesModal from '@components/UnsavedChangesModal';
import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';
import { rankOptions } from '@utils/staticData/rankOptions';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { IAppUser } from '@store/griffin_api/users/models';
import { useUpdateUserMutation } from '@store/griffin_api/users/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectAppUser, setAppUser, setCurrentUnit } from '@store/slices';

/* Unit and User Information Section */
const InformationSection: React.FC = () => {
  const appUser = useAppSelector(selectAppUser);
  const dispatch = useAppDispatch();

  const { data: units, isSuccess: isUnitsSuccess } = useGetUnitsQuery({});
  const [updateUser] = useUpdateUserMutation();

  const [updatedAppUser, setUpdatedAppUser] = useState<IAppUser>(appUser);
  const [formErrors, setFormErrors] = useState({
    rank: false,
    firstName: false,
    lastName: false,
    unit: false,
  });

  /* ***************************
   * State Declaration Variables
   ***************************** */
  const [userEditMode, setUserEditMode] = useState<boolean>(false);
  const [unitEditMode, setUnitEditMode] = useState<boolean>(false);

  const [snackbarSuccess, setSnackbarSuccess] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pendingBlocker, setPendingBlocker] = useState<Blocker | undefined>(undefined);

  const theme = useTheme();

  const readOnlyStyles = {
    '& .MuiOutlinedInput-root': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.disabled,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.disabled,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.disabled,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.text.secondary,
    },
  };

  /* ******************
   * Navigation Blocker
   ******************* */
  const blocker = useNavigationBlocker({
    // only block if there are actual unsaved changes in edit mode
    shouldBlock:
      appUser !== null &&
      (userEditMode || unitEditMode) &&
      (updatedAppUser.rank !== appUser.rank ||
        titlecase(updatedAppUser.firstName) !== titlecase(appUser.firstName) ||
        titlecase(updatedAppUser.lastName) !== titlecase(appUser.lastName) ||
        updatedAppUser.jobDescription !== (appUser.jobDescription ?? '') ||
        updatedAppUser.unit !== appUser.unit ||
        updatedAppUser.globalUnit !== (appUser.globalUnit ?? appUser.unit)),
    onTrigger: () => {
      setShowModal(true);
      setPendingBlocker(blocker);
    },
  });

  /* **********************************
   * Field Update Handler Functions
   *********************************** */
  const handleHomeUnitOnChange = (selection: IUnitBrief) => {
    setUpdatedAppUser({ ...updatedAppUser, unit: selection });
  };

  const handleGlobalUnitOnChange = (selection: IUnitBrief) => {
    setUpdatedAppUser({ ...updatedAppUser, globalUnit: selection });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = event.target;
    setUpdatedAppUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  /* **********************************
   * Save and Cancel Handler Functions
   *********************************** */
  const validateForm = () => {
    const newFormErrors = {
      rank: !updatedAppUser.rank,
      firstName: !updatedAppUser.firstName,
      lastName: !updatedAppUser.lastName,
      unit: updatedAppUser.unit.uic.length === 0,
    };

    setFormErrors(newFormErrors);
    return !Object.values(newFormErrors).some((value) => value === true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const response = await updateUser(updatedAppUser);
      if (response && !response.error) {
        setAppUser(updatedAppUser);
        setUserEditMode(false);
        setUnitEditMode(false);

        setSnackbarSuccess(true);
        setShowSnackbar(true);
      } else {
        setSnackbarSuccess(false);
        setShowSnackbar(true);
        dispatch(setCurrentUnit(updatedAppUser.globalUnit)); // Saves in App STate & local storage
      }
    } catch (err) {
      setSnackbarSuccess(false);
      setShowSnackbar(true);
    }
  };

  const handleCancel = () => {
    setUpdatedAppUser(appUser);
    setUserEditMode(false);
    setUnitEditMode(false);
  };

  /* *****************************
   * Exit Modal Handler Functions
   ****************************** */
  const handleModalSave = useCallback(() => {
    handleSave();
    setShowModal(false);
    if (pendingBlocker && typeof pendingBlocker.proceed === 'function') {
      pendingBlocker.proceed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocker]);

  const handleModalDiscard = useCallback(() => {
    handleCancel();
    setShowModal(false);
    if (pendingBlocker && typeof pendingBlocker.proceed === 'function') {
      pendingBlocker.proceed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocker]);

  const handleModalCancel = useCallback(() => {
    setShowModal(false);
    if (pendingBlocker && typeof pendingBlocker.reset === 'function') {
      pendingBlocker.reset();
    }
  }, [pendingBlocker]);

  /* *****************************
   * Save and Cancel Button UI
   ****************************** */
  const FormButtons = () => {
    return (
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'right' }}>
        <Button data-testid="cancel-button" variant="outlined" color="primary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button data-testid="save-button" sx={{ mr: 2 }} variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    );
  };

  /* *****************************
   * InformationSection Component UI
   ****************************** */
  return (
    <Box sx={{ width: '75%' }}>
      <Snackbar
        data-testid={'info-save-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{
          marginTop: '75px',
          '& .MuiSnackbarContent-root': {
            backgroundColor: (theme) =>
              snackbarSuccess
                ? theme.palette.mode === 'dark'
                  ? theme.palette.success.l80
                  : theme.palette.success.d20
                : theme.palette.mode === 'dark'
                  ? theme.palette.error.l80
                  : theme.palette.error.d20,
            color: (theme) =>
              snackbarSuccess
                ? theme.palette.mode === 'dark'
                  ? theme.palette.success.d60
                  : theme.palette.common.white
                : theme.palette.mode === 'dark'
                  ? theme.palette.error.d60
                  : theme.palette.common.white,
          },
        }}
        message={
          snackbarSuccess ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <TaskAlt />
              <Typography>Changes saved!</Typography>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={2}>
              <ErrorOutline />
              <Typography>Error occurred while saving.</Typography>
            </Stack>
          )
        }
      />
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} pb={3}>
          <Typography variant="h6" sx={{ my: 4 }}>
            User Information
          </Typography>
          <IconButton
            data-testid="user-edit-icon"
            disabled={unitEditMode || userEditMode}
            onClick={() => setUserEditMode(true)}
          >
            <EditIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={2} my={2}>
          <TextField
            select
            required
            id="rank-select"
            label="Rank"
            data-testid="rank-select"
            name="rank"
            value={updatedAppUser.rank}
            onChange={handleChange}
            inputProps={{ readOnly: !userEditMode, 'aria-label': 'Rank Input' }}
            sx={{
              m: 1,
              width: '33%',
              ...(!userEditMode && { ...readOnlyStyles }),
            }}
            error={formErrors.rank}
            helperText={formErrors.rank && 'Rank is required.'}
          >
            {rankOptions.map((rank) => (
              <MenuItem key={rank.value} value={rank.value}>
                {rank.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            id="first-name"
            label="First Name"
            data-testid="first-name"
            name="firstName"
            value={updatedAppUser.firstName}
            onChange={handleChange}
            inputProps={{ readOnly: !userEditMode, 'aria-label': 'First Name Input' }}
            sx={{ m: 1, width: '33%', ...(!userEditMode && { ...readOnlyStyles }) }}
            error={formErrors.firstName}
            helperText={formErrors.firstName && 'First name is required.'}
          />
          <TextField
            required
            id="last-name"
            label="Last Name"
            data-testid="last-name"
            name="lastName"
            value={updatedAppUser.lastName}
            onChange={handleChange}
            inputProps={{ readOnly: !userEditMode, 'aria-label': 'Last Name Input' }}
            sx={{ m: 1, width: '33%', ...(!userEditMode && { ...readOnlyStyles }) }}
            error={formErrors.lastName}
            helperText={formErrors.lastName && 'Last name is required.'}
          />
        </Stack>
        <TextField
          id="job-description"
          label="Job Description"
          data-testid="job-description"
          name="jobDescription"
          value={updatedAppUser.jobDescription}
          onChange={handleChange}
          inputProps={{ readOnly: !userEditMode, 'aria-label': 'Job Description Input' }}
          InputLabelProps={{ shrink: true }}
          sx={{ my: 1, width: '100%', ...(!userEditMode && { ...readOnlyStyles }) }}
          rows={2}
          multiline
        />
        <Box sx={{ mt: 2 }}>{userEditMode && <FormButtons />}</Box>
      </Paper>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} pb={3}>
          <Typography variant="h6" sx={{ my: 4 }}>
            Unit Information
            <Tooltip
              placement={'top-start'}
              title={
                <div>
                  Home Unit: User&apos;s assigned unit.
                  <br />
                  Global Unit: User&apos;s default unit for Griffin.AI data.
                </div>
              }
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: (theme) => theme.palette.layout.background8,
                  },
                },
              }}
            >
              <IconButton>
                <Info />
              </IconButton>
            </Tooltip>
          </Typography>
          <IconButton
            data-testid="unit-edit-icon"
            disabled={unitEditMode || userEditMode}
            onClick={() => setUnitEditMode(true)}
          >
            <EditIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={2} my={2}>
          <FormControl sx={{ m: 1, width: '50%' }}>
            <UnitSelect
              units={isUnitsSuccess ? mapUnitsWithTaskforceHierarchy(units) : []}
              onChange={handleHomeUnitOnChange}
              value={updatedAppUser.unit}
              readOnly={!unitEditMode}
              label="Home Unit"
              id="home-unit"
              error={formErrors.unit}
              helperText={formErrors.unit ? 'Unit is required.' : ''}
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: '50%' }}>
            <UnitSelect
              units={isUnitsSuccess ? mapUnitsWithTaskforceHierarchy(units) : []}
              onChange={handleGlobalUnitOnChange}
              value={updatedAppUser.globalUnit}
              readOnly={!unitEditMode}
              label="Global Unit"
              id="global-unit"
            />
          </FormControl>
        </Stack>
        <Box>{unitEditMode && <FormButtons />}</Box>
      </Paper>
      <UnsavedChangesModal
        open={showModal}
        handleSave={handleModalSave}
        handleDiscard={handleModalDiscard}
        handleCancel={handleModalCancel}
      />
    </Box>
  );
};

export default InformationSection;
