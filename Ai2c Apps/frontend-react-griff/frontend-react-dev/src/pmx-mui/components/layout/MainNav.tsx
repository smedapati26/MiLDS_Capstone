import { FC } from 'react';
import { NavLink, RouteObject } from 'react-router-dom';

import { Box, Button, ButtonProps, styled, Tooltip, Typography } from '@mui/material';

import { MAIN_NAV_DRAWER_HEIGHT, MAIN_NAV_DRAWER_WIDTH, MAIN_NAV_DRAWER_WIDTH_CLOSED } from '../../constants';

interface StyledNavButtonProps extends ButtonProps {
  isNavTop?: boolean;
}

export const StyledNavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isNavTop',
})<StyledNavButtonProps>(({ theme, isNavTop }) => {
  const navHeight = isNavTop ? MAIN_NAV_DRAWER_HEIGHT : MAIN_NAV_DRAWER_WIDTH_CLOSED;
  const primaryHover =
    theme.palette.mode === 'dark' ? `${theme.palette.primary?.d40}99` : `${theme.palette.primary?.l40}99`;
  const activeStyles = {
    fontWeight: 500,
    color: isNavTop ? theme.palette.primary.main : theme.palette.text.primary,
    backgroundColor: isNavTop ? 'transparent' : primaryHover,
    borderLeft: isNavTop ? 'none' : `5px solid ${theme.palette.primary.main}`,
  };

  return {
    display: 'flex',
    padding: 0,
    textTransform: 'none',
    height: navHeight,
    width: '100%',
    minWidth: isNavTop ? MAIN_NAV_DRAWER_WIDTH : MAIN_NAV_DRAWER_WIDTH_CLOSED,
    textAlign: 'left',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: isNavTop ? 'transparent' : primaryHover,
    },
    [theme.breakpoints.down('sm')]: isNavTop ? { display: 'none' } : null,
    a: {
      color: theme.palette.text.secondary,
      display: 'flex',
      alignItems: isNavTop ? 'left' : 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      height: navHeight,
      width: '100%',
      borderLeft: '5px solid transparent',
      '&:focus': activeStyles,
      '&:hover': {
        color: theme.palette.mode === 'dark' ? `${theme.palette.primary?.d20}66` : `${theme.palette.primary?.l20}66`,
      },
      padding: isNavTop ? theme.spacing(2) : 0,
    },
    '& .MuiTypography-h7': {
      fontWeight: 400,
      width: '100%',
      paddingLeft: theme.spacing(3),
    },
    '& .active': {
      ...activeStyles,
      '& .MuiTypography-h7': {
        fontWeight: 500,
      },
    },
  };
});

/**
 * @typedef MainNavProps
 * @prop { Array<RouteObject> } [routes] - App Routes
 * @prop { open } [boolean] - is left-hand side menu open?
 * @prop { isNavTop } [boolean] - is navigation menu to be displayed at top?
 */
export type MainNavProps = {
  routes?: Array<RouteObject>;
  bottomRoutes?: Array<RouteObject>;
  open?: boolean;
  isNavTop?: boolean;
};

/**
 * MainNav component renders a navigation menu based on the provided routes.
 *
 * @param { MainNavProps } props
 *
 * @returns {JSX.Element} The rendered main navigation.
 */
export const MainNav: FC<MainNavProps> = ({ routes, bottomRoutes, open = false, isNavTop = false }) => {
  if (!routes) return null;

  /* Helper function to reuse NavLinks for routes and bottom routes*/
  const getLink = (route: RouteObject) => {
    return (
      <StyledNavButton key={route.label} data-testid={`main-nav-drawer-link-${route.path}`} isNavTop={isNavTop}>
        <NavLink to={route.path as string}>
          {open || !route.icon ? (
            <Typography variant="h7">{route.label}</Typography>
          ) : (
            <Tooltip title={route.label} placement={isNavTop ? 'bottom' : 'right'}>
              {route.icon}
            </Tooltip>
          )}
        </NavLink>
      </StyledNavButton>
    );
  };

  return (
    <nav style={{ display: `${isNavTop ? 'flex' : 'block'}` }}>
      {routes
        .filter((route) => !route.index) // Do not display index routes
        .map((route: RouteObject) => getLink(route))}
      {bottomRoutes && !isNavTop && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            mb: 10,
            width: '100%',
          }}
        >
          {bottomRoutes.filter((route) => !route.index).map((route: RouteObject) => getLink(route))}
        </Box>
      )}
    </nav>
  );
};
