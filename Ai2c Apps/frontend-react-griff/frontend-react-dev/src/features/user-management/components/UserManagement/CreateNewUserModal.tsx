import { FunctionComponent, useState } from 'react';

import { Close, PersonAddAlt1 } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

import { UnitSelect } from '@components/dropdowns/UnitSelect';
import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';
import { rankOptions } from '@utils/staticData/rankOptions';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { ICreateAppUserOut } from '@store/griffin_api/users/models';
import { IUserRoleOut, UserRoleOptions } from '@store/griffin_api/users/models/IUserRole';
import { useCreateUserMutation } from '@store/griffin_api/users/slices';
import { useCreateRoleMutation } from '@store/griffin_api/users/slices/userRoleApi';

/* Props for the CreateNewUserModal component. */
interface Props {
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A functional component that acts as a form for the Creating a New User.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
const CreateNewUserModal: FunctionComponent<Props> = (props: Props) => {
  const { setShowSnackbar, setSnackbarMessage } = props;
  /* ***************************
    State Variable Declaration
    *************************** */
  const { data: units, isSuccess: isUnitsSuccess } = useGetUnitsQuery({});
  const [userRoleCreate] = useCreateRoleMutation();
  const [userCreate] = useCreateUserMutation();
  const [open, setOpen] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [roleRequested, setRoleRequested] = useState<UserRoleOptions>(UserRoleOptions.READ);

  const [newUser, setNewUser] = useState<ICreateAppUserOut>({
    user_id: '',
    first_name: '',
    last_name: '',
    unit_uic: '',
    rank: '',
  });

  const [errors, setErrors] = useState({
    userId: false,
    firstName: false,
    lastName: false,
    rank: false,
    unit: false,
  });

  /* ***************************
    Handle Functions
    *************************** */
  const resetModal = () => {
    setNewUser({
      user_id: '',
      first_name: '',
      last_name: '',
      unit_uic: '',
      rank: '',
    });
    setErrors({
      userId: false,
      firstName: false,
      lastName: false,
      rank: false,
      unit: false,
    });
    setOpen(false);
    setShowError(false);
    setErrorMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setRoleRequested(e.target.value as UserRoleOptions);
  };

  const handleUnitChange = (selection: IUnitBrief) => {
    setNewUser((prevState) => ({
      ...prevState,
      unit_uic: selection.uic,
    }));
  };

  const handleSubmit = async () => {
    const emptyFields = {
      userId: newUser.user_id === '' || newUser.user_id.length !== 10,
      firstName: newUser.first_name === '',
      lastName: newUser.last_name === '',
      rank: newUser.rank === '',
      unit: newUser.unit_uic === '',
    };
    setErrors({ ...emptyFields });
    setShowError(false);

    if (!Object.values(emptyFields).some((value) => value === true)) {
      let errorMsg = undefined;

      try {
        const response = await userCreate(newUser);
        if (!response || response.error) {
          errorMsg = 'Does a user with the same DoD ID already exist?';
        }
      } catch (error) {
        errorMsg = 'Does a user with the same DoD ID already exist?';
      }

      if (roleRequested !== UserRoleOptions.READ) {
        const newRole: IUserRoleOut = {
          user_id: newUser.user_id,
          unit_uic: newUser.unit_uic,
          access_level: roleRequested,
        };

        try {
          const response = await userRoleCreate({ newRole: newRole });
          if (!response || response.error) {
            errorMsg = 'You do not have permissions to create an elevated role for the selected unit.';
          }
        } catch (error) {
          errorMsg = 'You do not have permissions to create an elevated role for the selected unit.';
        }
      }

      if (errorMsg) {
        setErrorMessage(errorMsg);
        setShowError(true);
      } else {
        resetModal();
        setSnackbarMessage(
          `New user account for ${newUser.rank} ${newUser.first_name} ${newUser.last_name} was created.`,
        );
        setShowSnackbar(true);
      }
    }
  };

  return (
    <Box aria-label="Create New User Modal">
      <Button
        variant="contained"
        startIcon={<PersonAddAlt1 />}
        onClick={() => setOpen(true)}
        sx={{ mt: (theme) => theme.spacing(3) }}
      >
        CREATE NEW USER
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '33%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Create New User</Typography>
            <IconButton size="large" onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ pt: 1, pb: 1 }}>
            <Typography>Fill out the required fields to create a new user account.</Typography>
          </Box>
          <FormGroup>
            <FormControl sx={{ width: '100%', mt: 2 }}>
              <TextField
                name="first_name"
                label="First Name"
                required
                value={newUser.first_name}
                onChange={handleChange}
                error={errors.firstName}
                inputProps={{
                  'aria-label': 'First Name Input',
                }}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
            <FormControl sx={{ width: '100%', mt: 4 }}>
              <TextField
                name="last_name"
                label="Last Name"
                required
                value={newUser.last_name}
                onChange={handleChange}
                error={errors.lastName}
                inputProps={{
                  'aria-label': 'Last Name Input',
                }}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
            <FormControl required sx={{ width: '100%', mt: 4 }}>
              <InputLabel id="rank-label" shrink>
                Rank
              </InputLabel>
              <Select
                name="rank"
                labelId="rank-label"
                label="Rank"
                required
                value={newUser.rank}
                onChange={handleChange}
                error={errors.rank}
                inputProps={{
                  'aria-label': 'Rank Input',
                }}
                notched
              >
                {rankOptions.map((rank) => (
                  <MenuItem key={rank.value} value={rank.value}>
                    {rank.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl required sx={{ width: '100%', mt: 4 }}>
              <TextField
                name="user_id"
                label="DoD ID"
                required
                value={newUser.user_id}
                onChange={handleChange}
                error={errors.userId}
                inputProps={{
                  'aria-label': 'DoD ID Input',
                }}
                InputLabelProps={{ shrink: true }}
                helperText={errors.userId && newUser.user_id.length !== 10 ? 'DoD ID must be 10 characters.' : ''}
              />
            </FormControl>
            <FormControl required sx={{ width: '100%', mt: 4 }}>
              <UnitSelect
                units={isUnitsSuccess ? mapUnitsWithTaskforceHierarchy(units) : []}
                value={units?.find((unit) => unit.uic === newUser.unit_uic)}
                onChange={handleUnitChange}
                error={errors.unit}
              />
            </FormControl>
            <FormControl required sx={{ width: '100%', mt: 4, mb: 1 }}>
              <InputLabel id="role-label">User Role</InputLabel>
              <Select
                name="access_granted"
                labelId="role-label"
                label="User Role"
                value={roleRequested}
                onChange={handleRoleChange}
                inputProps={{
                  'aria-label': 'User Role Input',
                }}
              >
                {Object.entries(UserRoleOptions).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGroup>
          <Box sx={{ textAlign: 'right' }}>
            <Button variant="outlined" sx={{ m: 2 }} onClick={() => resetModal()}>
              CANCEL
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              CONFIRM
            </Button>
          </Box>
          {showError && (
            <Alert severity="error" variant="filled" sx={{ mt: 2 }} data-testid="new-user-error-alert">
              An error occured while saving. {errorMessage}
              <IconButton onClick={() => setShowError(false)}>
                <Close />
              </IconButton>
            </Alert>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CreateNewUserModal;
