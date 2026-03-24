import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { Echelon, Heading, titlecase } from '@ai2c/pmx-mui';

import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useUpdateUserMutation } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectAppUser, setAppUser } from '@store/slices';

import { UserPermissionsTabs } from './components/UserPermissionsTabs';

import { UnitSelect } from '../components/UnitSelect';
import { rankOptions } from '../staticData/rankOptions';
import { ICreateAppUserOut } from '../store/amap_ai/user/models';

interface FormValues {
  userId: string;
  rank: string;
  firstName: string;
  lastName: string;
  selectedUnit: IUnitBrief;
}

const emptyUnit: IUnitBrief = {
  uic: '',
  shortName: '',
  displayName: '',
  nickName: '',
  echelon: Echelon.UNKNOWN,
  parentUic: '',
  component: '',
  state: '',
  level: -1,
};

const AccountProfile: React.FC = () => {
  const { data: units, isSuccess } = useGetUnitsQuery({ role: 'Manager' });
  const appUser = useAppSelector(selectAppUser);
  const dispatch = useAppDispatch();
  const [updateUser] = useUpdateUserMutation();

  const [personalEditMode, setPersonalEditMode] = useState(false);
  const [undoData, setUndoData] = useState<Partial<FormValues>>({});

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      userId: '',
      rank: '',
      firstName: '',
      lastName: '',
      selectedUnit: emptyUnit,
    },
  });

  // Load user into form
  useEffect(() => {
    if (appUser) {
      reset({
        userId: appUser.userId,
        rank: appUser.rank,
        firstName: titlecase(appUser.firstName),
        lastName: titlecase(appUser.lastName),
        selectedUnit: appUser.unit as IUnitBrief,
      });
    }
  }, [appUser, reset]);

  useEffect(() => {
    if (personalEditMode) {
      setUndoData({
        rank: watch('rank'),
        firstName: watch('firstName'),
        lastName: watch('lastName'),
        selectedUnit: watch('selectedUnit'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalEditMode]);

  const onSubmit = (data: FormValues) => {
    const payload: ICreateAppUserOut = {
      user_id: data.userId,
      rank: data.rank,
      first_name: data.firstName,
      last_name: data.lastName,
      unit_uic: data.selectedUnit.uic,
    };

    updateUser({ userId: data.userId, ...payload });

    dispatch(
      setAppUser({
        ...appUser,
        rank: data.rank,
        firstName: data.firstName,
        lastName: data.lastName,
        unit: data.selectedUnit,
      }),
    );

    setPersonalEditMode(false);
  };

  const handleCancel = () => {
    reset({
      userId: watch('userId'),
      rank: undoData.rank ?? watch('rank'),
      firstName: undoData.firstName ?? watch('firstName'),
      lastName: undoData.lastName ?? watch('lastName'),
      selectedUnit: undoData.selectedUnit ?? watch('selectedUnit'),
    });

    setPersonalEditMode(false);
  };

  const FormButtons = () => (
    <Stack direction="row" spacing={2} mt={3} mr={3} sx={{ justifyContent: 'right' }}>
      <Button variant="outlined" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleSubmit(onSubmit)}>
        Save
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Heading variant="h4" sx={{ mb: 6 }}>
        Account Management
      </Heading>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" pb={3}>
              <Typography variant="h6">User Information</Typography>

              <IconButton
                aria-label="edit profile"
                disabled={personalEditMode}
                onClick={() => setPersonalEditMode(true)}
              >
                <EditIcon />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller
                name="rank"
                control={control}
                rules={{ required: 'Rank is required' }}
                render={({ field }) => (
                  <FormControl sx={{ width: 250 }} error={!!errors.rank}>
                    <InputLabel>Rank</InputLabel>
                    <Select {...field} label="Rank" inputProps={{ readOnly: !personalEditMode }}>
                      {rankOptions.map((rank) => (
                        <MenuItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.rank && <FormHelperText>{errors.rank.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    sx={{ width: 250 }}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    inputProps={{ readOnly: !personalEditMode }}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    sx={{ width: 250 }}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    inputProps={{ readOnly: !personalEditMode }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" mt={3}>
              <Controller
                name="selectedUnit"
                control={control}
                rules={{
                  validate: (v) => (v?.uic ? true : 'Unit is required'),
                }}
                render={({ field }) => (
                  <UnitSelect
                    units={isSuccess ? units : []}
                    value={field.value}
                    onChange={field.onChange}
                    readOnly={!personalEditMode}
                    width="382px"
                  />
                )}
              />

              {errors.selectedUnit && <FormHelperText error>{errors.selectedUnit.message as string}</FormHelperText>}
            </Stack>

            {personalEditMode && <FormButtons />}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <UserPermissionsTabs />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountProfile;
