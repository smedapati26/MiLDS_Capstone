import { useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';

import { Button, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
  AppBarUserMenu,
  Classification,
  FuzzySearchUnit,
  GlobalUnitSelect,
  MainLayout,
  PmxThemeContextProvider,
  Unit,
  usePmxMuiTheme,
} from '@ai2c/pmx-mui';

import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { IAppUser } from '@store/amap_ai/user/models';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setCurrentUnit } from '@store/slices/appSettingsSlice';
import { amapPalette, extendTheme } from '@theme/theme';
import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';

import SnackbarProvider from './context/SnackbarProvider';

import { AmapIcon, LogoutBtn } from './components';
import { useInitializeUser } from './hooks';
import { bottomRoutes, routes } from './routes';

const App = () => {
  const [baseTheme, colorMode] = usePmxMuiTheme(amapPalette);
  const theme = extendTheme(baseTheme);

  const appUser = useLoaderData() as IAppUser;
  const dispatch = useAppDispatch();
  const { data: units, isSuccess } = useGetUnitsQuery({ role: 'Any' });

  const { currentUnit } = useAppSelector((s) => s.appSettings);

  useInitializeUser(appUser, units as Unit[], isSuccess);

  const handleOnCurrentUnitChange = (selection: Unit) => {
    dispatch(setCurrentUnit(selection));
  };

  useEffect(() => {
    localStorage.setItem('theme_color_mode', theme.palette.mode);
  }, [theme]);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MainLayout
              title={import.meta.env.VITE_APP_TITLE}
              routes={routes(appUser.unitRoles ? appUser.unitRoles.manager.length > 0 : false)}
              bottomRoutes={bottomRoutes(
                appUser.hasOpenRequests ?? false,
                appUser.unitRoles ? appUser.unitRoles.manager.length > 0 : false,
              )}
              appIcon={<AmapIcon />}
              appBarCenter={
                <GlobalUnitSelect
                  units={isSuccess ? (mapUnitsWithTaskforceHierarchy(units) as FuzzySearchUnit[]) : []}
                  defaultValue={isSuccess ? (currentUnit as Unit) : undefined}
                  handleOnChange={handleOnCurrentUnitChange}
                />
              }
              userMenu={
                <AppBarUserMenu user={{ ...appUser, unit: appUser.uic, rank: appUser.rank ?? '' }}>
                  <Button
                    component={Link}
                    to="/profile"
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ width: '100%' }}
                  >
                    Manage Your Account
                  </Button>
                  <LogoutBtn />
                </AppBarUserMenu>
              }
              classification={Classification.CUI}
            />
          </LocalizationProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </PmxThemeContextProvider>
  );
};

export default App;
