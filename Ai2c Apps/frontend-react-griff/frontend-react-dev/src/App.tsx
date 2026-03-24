import { useCallback, useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';

import { Badge, Button, Divider, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
  AppBarUserMenu,
  Classification,
  FuzzySearchUnit,
  GlobalUnitSelect,
  GriffinBeakIcon,
  MainLayout,
  PmxThemeContextProvider,
  Unit,
  usePmxMuiTheme,
} from '@ai2c/pmx-mui';

import LogoutButton from '@components/LogoutButton';
import { useElevatedRolesPermissions } from '@hooks/useElevatedRolesPermissions';
import { useInitializeUnits } from '@hooks/useInitializeUnits';
import { extendTheme, griffinPalette } from '@theme/theme';

import { ITransferRequest } from '@store/griffin_api/auto_dsr/models/ITransferRequest';
import {
  useAddFavoriteUnitsMutation,
  useGetFavoriteUnitsQuery,
  useGetTransferRequestsQuery,
  useRemoveFavoriteUnitsMutation,
} from '@store/griffin_api/auto_dsr/slices';
import { IAdminRoleRequest, IAppUser } from '@store/griffin_api/users/models';
import { useGetAllRoleRequestsForAdminQuery, useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { SnackbarProvider } from '@store/providers/SnackbarProvider';
import { setCurrentUnit } from '@store/slices/appSettingsSlice';

import { adminRoutes, routes } from './routes';

import './chartjs-setup';

const App = () => {
  const [baseTheme, colorMode] = usePmxMuiTheme(griffinPalette);
  const theme = extendTheme(baseTheme);
  const appUser = useLoaderData() as IAppUser;

  const dispatch = useAppDispatch();
  const currentUic = useAppSelector((state) => state.appSettings.currentUic);

  // Initialize units & save to appSettings slice
  const { units, isSuccess } = useInitializeUnits(appUser);

  // Initialize elevated Roles & save to appSettings slice
  const { isAdmin } = useElevatedRolesPermissions(appUser.userId, currentUic);
  const { data: adminRoleRequests } = useGetAllRoleRequestsForAdminQuery(undefined, {
    skip: !isAdmin && !appUser.isAdmin,
  });

  const { data: elevatedRoles } = useGetUserElevatedRolesQuery(appUser.userId);
  const { data: equipmentTransferRequests } = useGetTransferRequestsQuery(undefined, {
    skip: !isAdmin && !appUser.isAdmin,
  });

  const { data: favoriteUnits } = useGetFavoriteUnitsQuery({ userId: appUser.userId });
  const [removeFavoriteUnit] = useRemoveFavoriteUnitsMutation();
  const [addFavoriteUnit] = useAddFavoriteUnitsMutation();

  const updatedAdminRoutes = useCallback(() => {
    return adminRoutes.map((route) => {
      let requests: IAdminRoleRequest[] | ITransferRequest[] = [];
      if (route.label === 'User Management') {
        requests = adminRoleRequests ?? [];
      } else if (route.label === 'Equipment Transfer') {
        const adminUics = elevatedRoles?.admin || [];
        requests = equipmentTransferRequests?.filter((request) => adminUics.includes(request.destinationUic)) ?? [];
      }

      const icon =
        requests && requests.length > 0 ? (
          <Badge
            color="error"
            variant="dot"
            sx={{ '& .MuiBadge-badge': { height: '12px', width: '12px', borderRadius: '6px' } }}
          >
            {route.icon}
          </Badge>
        ) : (
          route.icon
        );
      return { ...route, icon };
    });
  }, [adminRoleRequests, elevatedRoles?.admin, equipmentTransferRequests]);

  useEffect(() => localStorage.setItem('theme_color_mode', theme.palette.mode), [theme]);

  // Handles Global Current Unit Change
  const handleOnCurrentUnitChange = (selection: Unit) => {
    dispatch(setCurrentUnit(selection));
  };

  // Handles toggle favorite units from Global Unit Select
  const handleToggleFavorite = async (selection: Unit) => {
    if (favoriteUnits?.find((unit) => unit.uic === selection.uic)) {
      await removeFavoriteUnit({ userId: appUser.userId, uics: [selection.uic] });
    } else {
      await addFavoriteUnit({ userId: appUser.userId, uics: [selection.uic] });
    }
  };

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <MainLayout
              title={import.meta.env.VITE_APP_TITLE}
              routes={routes}
              bottomRoutes={isAdmin || appUser.isAdmin ? updatedAdminRoutes() : []}
              appIcon={<GriffinBeakIcon />}
              appBarCenter={
                isSuccess &&
                currentUic && (
                  <GlobalUnitSelect
                    units={units as Unit[]}
                    defaultValue={currentUic}
                    handleOnChange={handleOnCurrentUnitChange}
                    favoriteUnits={favoriteUnits as Array<FuzzySearchUnit>}
                    handleToggleFavorite={handleToggleFavorite}
                  />
                )
              }
              userMenu={
                <AppBarUserMenu user={{ ...appUser, unit: appUser?.unit.uic }}>
                  <Divider />
                  <Button
                    component={Link}
                    to="/profile"
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ width: '100%', mt: 3, mb: 3 }}
                  >
                    Manage Your Account
                  </Button>
                  <LogoutButton />
                </AppBarUserMenu>
              }
              classification={Classification.CUI}
            />
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </PmxThemeContextProvider>
  );
};

export default App;
