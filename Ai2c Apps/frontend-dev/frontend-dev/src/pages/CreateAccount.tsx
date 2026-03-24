import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  ThemeProvider,
} from '@mui/material';

import { AmapIcon, Echelon, PmxThemeContextProvider, titlecase, usePmxMuiTheme } from '@ai2c/pmx-mui';

import { loginUrl } from '@loaders/authLoader';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { IAppUser, IAppUserDto, ICreateAppUserOut, mapToIAppUser } from '@store/amap_ai/user/models';
import { useCreateUserMutation } from '@store/amap_ai/user/slices/userApi';
import { amapPalette } from '@theme/theme';

import { UnitSelect } from '../components/UnitSelect';
import { rankOptions } from '../staticData/rankOptions';

interface AccountCreationErrors {
  rank: string;
  firstName: string;
  lastName: string;
  unit: string;
}

/* CreateAccount Content View */
const CreateAccount: React.FC = () => {
  const [theme, colorMode] = usePmxMuiTheme(amapPalette);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [rank, setRank] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const { data: units, isSuccess } = useGetUnitsQuery({
    role: 'Any',
    true_all: true,
  });
  const [createUser] = useCreateUserMutation();

  const [selectedUnit, setSelectedUnit] = useState<IUnitBrief>({
    uic: '',
    shortName: '',
    displayName: '',
    echelon: Echelon.UNKNOWN,
    parentUic: '',
    nickName: '',
    component: '',
    state: '',
    level: -1,
  });
  const [formErrors, setFormErrors] = useState<AccountCreationErrors>({
    rank: '',
    firstName: '',
    lastName: '',
    unit: '',
  });

  // Re-execute the who-am-i call to get user first and last name for account creation
  useEffect(() => {
    fetch(loginUrl)
      .then((data) => data.json())
      .then((appUserDto: IAppUserDto) => mapToIAppUser(appUserDto))
      .then((data: IAppUser) => {
        setUserId(data.userId);
        setFirstName(titlecase(data.firstName));
        setLastName(titlecase(data.lastName));
      });
  }, []);

  // Handling rank selection change
  const handleRankSelect = (event: SelectChangeEvent) => {
    setRank(event.target.value);
  };

  // Handling unit selection change
  const handleUnitOnChange = (selection: IUnitBrief) => {
    setSelectedUnit(selection);
  };

  // Handling Name changes
  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
  };
  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
  };

  // Validation for Account Creation
  const validateForm = () => {
    let formIsValid = true;
    const newFormErrors = { rank: '', firstName: '', lastName: '', unit: '' };
    if (!rank) {
      newFormErrors.rank = 'Rank is required';
      formIsValid = false;
    }

    if (!firstName) {
      newFormErrors.firstName = 'First Name is required';
      formIsValid = false;
    }

    if (!lastName) {
      newFormErrors.lastName = 'Last Name is required';
      formIsValid = false;
    }

    if (selectedUnit.uic.length == 0) {
      newFormErrors.unit = 'Unit is required';
      formIsValid = false;
    }

    setFormErrors(newFormErrors);
    return formIsValid;
  };

  // Handling Create Account Button Click
  const handleCreateAccountClick = async () => {
    if (validateForm()) {
      const userFormData: ICreateAppUserOut = {
        user_id: userId,
        rank: rank,
        first_name: firstName,
        last_name: lastName,
        unit_uic: selectedUnit.uic,
      };
      await createUser(userFormData);
      navigate('/');
    }
  };

  // used to set the maximum height for the Rank Selection dropdown component
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 225,
      },
    },
  };

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            minWidth: '100vw',
          }}
        >
          <Container
            variant="secondary"
            // component='section'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '368px',
              height: '566px',
            }}
          >
            <Box sx={{ margin: 4 }}>
              <AmapIcon width="110px" height="104.2px" />
            </Box>
            <Divider orientation="horizontal" flexItem sx={{ mx: 2, mb: 4 }} />
            <Box
              component="form"
              sx={{
                '& > :not(style)': { my: 2, mx: 2, width: '324px' },
              }}
              noValidate
              autoComplete="off"
            >
              <FormControl required sx={{ m: 1, minWidth: 120 }} error={Boolean(formErrors.rank)}>
                <InputLabel id="rank-select-label">Rank</InputLabel>
                <Select
                  labelId="rank-select-label"
                  id="rank-select"
                  value={rank}
                  label="Unit *"
                  onChange={handleRankSelect}
                  MenuProps={MenuProps}
                >
                  {rankOptions.map((rank) => {
                    return (
                      <MenuItem key={rank.value} value={rank.value}>
                        {rank.label}
                      </MenuItem>
                    );
                  })}
                </Select>
                {formErrors.rank && <FormHelperText>{formErrors.rank}</FormHelperText>}
              </FormControl>
              <TextField
                aria-label="First Name"
                error={Boolean(formErrors.firstName)}
                required
                id="first-name"
                label="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
                helperText={formErrors.firstName ? formErrors.firstName : ''}
              />
              <TextField
                error={Boolean(formErrors.lastName)}
                required
                aria-label="Last Name"
                id="last-name"
                label="Last Name"
                value={lastName}
                onChange={handleLastNameChange}
                helperText={formErrors.lastName ? formErrors.lastName : ''}
              />
              <UnitSelect
                error={Boolean(formErrors.unit)}
                units={isSuccess ? units : []}
                onChange={handleUnitOnChange}
                value={selectedUnit}
                width="325px"
                helperText={formErrors.unit ? formErrors.unit : ''}
              />
              <Button
                sx={{ height: '42px' }}
                size="large"
                variant="contained"
                color="primary"
                onClick={handleCreateAccountClick}
              >
                Create Account
              </Button>
            </Box>
          </Container>
        </Container>
      </ThemeProvider>
    </PmxThemeContextProvider>
  );
};

export default CreateAccount;
