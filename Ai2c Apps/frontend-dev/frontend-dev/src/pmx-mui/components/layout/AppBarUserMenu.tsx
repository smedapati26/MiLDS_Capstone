import React from 'react';
import { NavLink, RouteObject } from 'react-router-dom';

import { Divider, SxProps, Theme, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { AppUser } from '../../models';
import { Popover } from '../Popover';
import { StyledNavButton } from './MainNav';

/**
 * @typedef AppBarUserMenuProps
 * @prop { React.ReactNode } user
 * @prop { React.ReactNode } [children]
 * @prop { React.ReactNode } [menuIcon]
 * @prop { Array<RouteObject> } [routes]
 */
export type AppBarUserMenuProps = {
  user: AppUser;
  children?: React.ReactNode;
  menuIcon?: React.ReactNode;
  routes?: Array<RouteObject>;
  sx?: SxProps<Theme>;
};

/**
 * App User Menu
 */
export const AppBarUserMenu: React.FC<AppBarUserMenuProps> = ({ routes, user, children, menuIcon, sx }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderMenu = (menuIcon: React.ReactNode): React.ReactNode => (
    <Box sx={{ p: 3, minWidth: 200, width: '100%', ...sx }}>
      {menuIcon && routes && (
        <>
          {routes
            .filter((route) => !route.index) // Do not display index routes
            .map((route: RouteObject) => {
              return (
                <StyledNavButton key={route.label} data-testid={`user-menu-nav-drawer-link-${route.path}`}>
                  <NavLink to={route.path as string} key={route.label}>
                    <Typography variant="h7">{route.label}</Typography>
                  </NavLink>
                </StyledNavButton>
              );
            })}
          <Divider style={{ backgroundColor: 'white', marginTop: 12, paddingTop: 1, paddingBottom: 1 }} />
        </>
      )}
      <Typography variant="h6" sx={{ pb: 2 }}>
        {user.firstName} {user.lastName}
      </Typography>
      <Typography variant="body1" sx={{ pb: 2 }}>
        {user.rank}
      </Typography>
      <Typography variant="body1" sx={{ pb: 2 }}>
        {user.unit}
      </Typography>
      {children}
    </Box>
  );

  return (
    <div>
      <IconButton
        id="user-menu-button"
        data-testid="user-menu-button"
        type="button"
        sx={{ padding: 0, marginLeft: useTheme().spacing(4) }}
        aria-controls={open ? 'menu-popover' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {menuIcon ? (
          menuIcon
        ) : (
          <Avatar
            sx={{ bgcolor: 'primary.main' }}
          >{`${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`}</Avatar>
        )}
      </IconButton>
      <Popover
        data-testid="user-menu-popover"
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ mt: 2 }}
      >
        {renderMenu(menuIcon)}
      </Popover>
    </div>
  );
};
