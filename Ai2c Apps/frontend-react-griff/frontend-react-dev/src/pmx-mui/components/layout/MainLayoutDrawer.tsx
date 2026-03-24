import React, { useEffect } from 'react';
import { RouteObject } from 'react-router-dom';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import { MAIN_NAV_DRAWER_WIDTH_CLOSED, MAIN_NAV_DRAWER_WIDTH_OPEN } from '../../constants';
import { MainNav } from './MainNav';

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  position: 'relative',
  height: '100%',
  '& .MuiDrawer-paper': {
    overflowX: 'hidden',
    paddingTop: theme.spacing(4),
    border: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: MAIN_NAV_DRAWER_WIDTH_OPEN,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      display: 'flex',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: MAIN_NAV_DRAWER_WIDTH_CLOSED,
      [theme.breakpoints.up('sm')]: {
        width: MAIN_NAV_DRAWER_WIDTH_CLOSED,
      },
    }),
  },
}));

/**
 * Props for the MainLayoutDrawer component.
 *
 * @typedef {Object} MainLayoutDrawerProps
 *
 * @property {Array<RouteObject>} [routes] - An optional array of route objects to be displayed in the drawer.
 * @property {Array<RouteObject>} [bottomRoutes] - An optional array of route objects to be displayed in the drawer towards the footer.
 * @property {function(boolean): void} [onOpen] - An optional callback function that is called when the drawer is opened or closed.
 * @property {boolean} [open] - An optional boolean indicating whether the drawer is open.
 * @property {boolean} [collapsable] - An optional boolean indicating whether the drawer is collapsable.
 * @property {boolean} [isNavTop] - An optional boolean indicating whether the navigation is at the top.
 * @property {React.ReactNode} [children] - Optional children elements to be rendered inside the drawer.
 */
export type MainLayoutDrawerProps = {
  routes?: Array<RouteObject>;
  bottomRoutes?: Array<RouteObject>;
  onOpen?: (open: boolean) => void;
  open?: boolean;
  collapsable?: boolean;
  isNavTop?: boolean;
  children?: React.ReactNode;
};

/**
 * Main Navigation Drawer
 *
 * @param { MainLayoutDrawerProps } props
 *
 * @returns {JSX.Element} The rendered navigation menu.
 */
export const MainLayoutDrawer: React.FC<MainLayoutDrawerProps> = ({
  routes,
  bottomRoutes,
  onOpen,
  open = false,
  collapsable = true,
  isNavTop,
  children,
}) => {
  // IF collapsable THEN use open param ELSE force panel open
  const [drawerOpen, setDrawerOpen] = React.useState(open);

  useEffect(() => {
    setDrawerOpen(!collapsable ? true : open);
  }, [open, collapsable]);

  const handleToggleDrawer = () => {
    if (onOpen) {
      onOpen(!drawerOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  return (
    <StyledDrawer id="test" data-testid="main-left-nav-drawer" variant="permanent" open={drawerOpen}>
      {!isNavTop && routes ? <MainNav routes={routes} bottomRoutes={bottomRoutes} open={drawerOpen} /> : null}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        {children}
      </Box>
      {collapsable ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 2,
          }}
        >
          <IconButton data-testid="main-left-nav-drawer-toggle" onClick={handleToggleDrawer}>
            {drawerOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
          </IconButton>
        </Box>
      ) : null}
    </StyledDrawer>
  );
};
