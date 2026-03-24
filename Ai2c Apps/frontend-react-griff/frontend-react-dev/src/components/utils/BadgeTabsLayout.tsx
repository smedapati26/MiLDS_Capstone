import { Link, Outlet, useLocation } from 'react-router-dom';

import { Badge, Box, Stack, Tab, TabProps, Tabs, Typography } from '@mui/material';

import { TabsLayoutProps } from '@ai2c/pmx-mui/components/layout/TabsLayout';

/**
 * Tab With Badge
 *
 * Custom Tab Component to add in Tab with Notification Badge if the notification count is greater than 0.
 *
 * @param { TabWithBadgeProps } props
 * @param { TabWithBadgeProps } count - number of notifications
 * @param { TabWithBadgeProps } displayCount - boolean to decide if notif badge should display count or just generic badge
 */

interface TabWithBadgeProps extends TabProps {
  count: number;
  displayCount: boolean;
}

const TabWithBadge = ({ key, label, value, to, count, displayCount }: TabWithBadgeProps): React.ReactNode => {
  if (count === 0) {
    return <Tab key={key} label={label} value={value} component={Link} to={to} />;
  }

  return (
    <Tab
      key={key}
      label={
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography>{label}</Typography>
          {displayCount ? (
            <Badge badgeContent={count} color="primary" sx={{ ml: 5, mr: 1 }} />
          ) : (
            <Badge
              color="error"
              variant="dot"
              sx={{ ml: 3, '& .MuiBadge-badge': { height: '12px', width: '12px', borderRadius: '6px' } }}
            />
          )}
        </Stack>
      }
      value={value}
      component={Link}
      to={to}
    />
  );
};

/**
 * Tabs With Badge Layout
 *
 * Custom TabsLayout Component to add in Tabs with Notification Badge.
 *
 * @param { TabsLayoutProps } props
 * @param { string[] } badgeRoutes - list of paths that should have badge displayed
 * @param { number } badgeCount - count of notifications, zero will display no badge
 */

interface BadgeTabsLayoutProps extends TabsLayoutProps {
  badgeRoutes: string[];
  badgeCount: number;
  displayCount?: boolean;
}

export const BadgeTabsLayout = ({
  title,
  routes,
  badgeRoutes,
  badgeCount,
  displayCount = true,
}: BadgeTabsLayoutProps) => {
  // Calculate tab value based on the last segment of the page
  const location = useLocation();
  const tabValue = routes ? location.pathname.split('/').pop() || routes[0]?.path : '';

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ p: 2 }}>
        {title}
      </Typography>
      <Tabs value={tabValue} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {routes &&
          routes.map((route) => {
            if (route.index) return null;

            const TabComponent = route.path && badgeRoutes.includes(route.path) ? TabWithBadge : Tab;

            return (
              <TabComponent
                key={route.path}
                label={route.label}
                value={route.path}
                to={route.path}
                component={Link}
                count={badgeCount}
                displayCount={displayCount}
              />
            );
          })}
      </Tabs>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
