import React, { createContext, Suspense, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, RouteObject } from 'react-router-dom';

import LightModeIcon from '@mui/icons-material/LightMode';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import { IconButton, Skeleton, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import { Classification } from '../../models/Classification';
import { ColorModeContext } from '../../theme/PmxThemeContextProvider';
import { ClassificationBanner } from './ClassificationBanner';
import { MainLayoutDrawer } from './MainLayoutDrawer';
import { MainNav } from './MainNav';
import { StylizedTitle } from './StylizedTitle';

/**
 * Classification Context
 *
 * Used to add styling height if context is used in other components. @see ScrollableLayout
 */

export const ClassificationContext = createContext<Classification | undefined>(undefined);

export const useClassificationContext = () => {
  const context = useContext(ClassificationContext);
  return context;
};

/**
 * Props for the MainLayout component.
 *
 * @property {Array<RouteObject>} [routes] - An optional array of route objects for the layout.
 * @property {Array<RouteObject>} [bottomRoutes] - An optional array of route objects for the layout that display at the bottom of the left nav.
 * @property {string | React.ReactNode} [title] - An optional title or React node to be displayed.
 * @property {React.ReactNode} [children] - Optional children elements to be rendered within the layout.
 * @property {React.ReactNode} [appIcon] - An optional React node for the application icon.
 * @property {React.ReactNode} [appBarLeft] - An optional React node for the left side of the app bar.
 * @property {React.ReactNode} [appBarCenter] - An optional React node for the center of the app bar.
 * @property {React.ReactNode} [appBarRight] - An optional React node for the right side of the app bar.
 * @property {React.ReactNode} [userMenu] - An optional React node for the user menu.
 * @property {Classification} [classification] - An optional classification object.
 * @property {string} [mode] - An optional string representing the mode.
 * @property {() => void} [toggleColorMode] - An optional function to toggle the color mode.
 * @property {'left' | 'top'} [mainNavPlacement = 'left'] - An optional string indicating the placement of the main navigation, either 'left' or 'top'.
 * @property {React.ReactNode} [leftDrawer] - An optional React node for the left drawer.
 * @property {boolean} [leftDrawerOpen = false] - An optional boolean indicating if the left drawer is open.
 * @property {boolean} [leftDrawerCollapsible = true] - An optional boolean indicating if the left drawer is collapsible.
 */
export type MainLayoutProps = {
  routes?: Array<RouteObject>;
  bottomRoutes?: Array<RouteObject>;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  appIcon?: React.ReactNode;
  appBarLeft?: React.ReactNode;
  appBarCenter?: React.ReactNode;
  appBarRight?: React.ReactNode;
  userMenu?: React.ReactNode;
  classification?: Classification;
  mode?: string;
  toggleColorMode?: () => void;
  mainNavPlacement?: 'left' | 'top';
  leftDrawer?: React.ReactNode;
  leftDrawerOpen?: boolean;
  leftDrawerCollapsible?: boolean;
};

/**
 * Main Layout
 *
 * @param { MainLayoutProps } props
 */
export const MainLayout: React.FC<MainLayoutProps> = (props) => {
  const {
    title,
    routes,
    bottomRoutes,
    children,
    appIcon,
    appBarLeft,
    appBarCenter,
    appBarRight,
    userMenu,
    classification,
    mode,
    toggleColorMode,
    mainNavPlacement = 'left',
    leftDrawer,
    leftDrawerOpen = false,
    leftDrawerCollapsible = true,
  } = props;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const isNavTop = mainNavPlacement === 'top';
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  useEffect(() => {
    setDrawerOpen(leftDrawerOpen || !leftDrawerCollapsible);
  }, [leftDrawerOpen, leftDrawerCollapsible]);

  const handleToggleMode = () => {
    colorMode.toggleColorMode();
    if (toggleColorMode) {
      toggleColorMode();
    }
  };
  const handleOnDrawerOpen = (open: boolean) => {
    setDrawerOpen(open);
  };

  return (
    <ClassificationContext.Provider value={classification}>
      <Box
        data-testid="main-layout"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.layout?.base,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            width: '100%',
            height: '100%',
            gridTemplateAreas: `"appbar appbar" "drawer main"`,
            gridTemplateColumns: 'auto 1fr',
            gridTemplateRows: `${classification ? 23 + 64 : 64}px auto`,
          }}
        >
          <AppBar sx={{ gridArea: 'appbar' }} position="fixed" data-testid="main-layout-appbar">
            {classification && <ClassificationBanner type={classification} />}
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box
                data-testid="main-layout-brand"
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                flexBasis="33.33vw"
              >
                {title && (
                  <Box sx={{ cursor: 'pointer', a: { display: 'flex', color: 'inherit', textDecoration: 'none' } }}>
                    <NavLink to={'/'}>
                      {appIcon && (
                        <Box data-testid="main-layout-icon" sx={{ pr: 3 }}>
                          {appIcon}
                        </Box>
                      )}
                      {typeof title === 'string' ? (
                        <StylizedTitle title={title} />
                      ) : (
                        <Box data-testid="main-layout-title" display="flex">
                          {title}
                        </Box>
                      )}
                    </NavLink>
                  </Box>
                )}
                {appBarLeft}
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" flexBasis="33.33vw">
                {appBarCenter}
                {isNavTop && routes ? <MainNav routes={routes} isNavTop={true} /> : null}
              </Box>
              <Box display="flex" justifyContent="flex-end" alignItems="center" flexBasis="33.33vw">
                {!toggleColorMode ? (
                  <IconButton data-testid="main-layout-color-mode-toggle" onClick={handleToggleMode}>
                    {mode === 'dark' || theme.palette.mode === 'dark' ? <ModeNightIcon /> : <LightModeIcon />}
                  </IconButton>
                ) : null}
                {appBarRight}
                {userMenu}
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ gridArea: 'drawer' }}>
            {!isNavTop || leftDrawer || drawerOpen ? (
              <MainLayoutDrawer
                routes={routes}
                bottomRoutes={bottomRoutes}
                open={drawerOpen}
                onOpen={handleOnDrawerOpen}
                collapsable={leftDrawerCollapsible}
                isNavTop={isNavTop}
              >
                {leftDrawer}
              </MainLayoutDrawer>
            ) : null}
          </Box>
          <Box component="main" sx={{ gridArea: 'main', p: 4 }}>
            <Suspense fallback={<TabSkeleton />}>
              <Outlet />
            </Suspense>
            {children}
          </Box>
        </Box>
      </Box>
    </ClassificationContext.Provider>
  );
};

const TabSkeleton = () => {
  return (
    <Box>
      <Skeleton variant="rectangular" width={150} height={50} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={500} />
    </Box>
  );
};
