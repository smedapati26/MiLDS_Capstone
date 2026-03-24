import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, RouteObject, useLocation } from 'react-router-dom';

import { Chip, SxProps, Theme, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { slugify } from '@ai2c/pmx-mui';

export type RouteWithBadge = RouteObject & {
  badgeContent?: number;
};

/**
 * a11yProps
 * @param { string } idPrefix
 * @param { string } index
 * @returns { React.HTMLProps }
 */
// eslint-disable-next-line react-refresh/only-export-components
export const a11yProps = (idPrefix: string, index: number) => {
  return {
    id: `${idPrefix}-tab-${index}`,
    'aria-controls': `${idPrefix}-tabpanel-${index}`,
  };
};

/**
 * @typedef TabsPageTab
 * @prop {  string | number } [id]
 * @prop { string } label
 * @prop { React.ReactNode } component
 */
export type TabsPageTab = {
  id?: string | number;
  label: string;
  component: React.ReactNode;
};

/**
 * @typedef TabsLayoutProps
 * @prop { string } title
 * @prop { React.ReactNode } [titleComponent]
 * @prop { number } [additionalScrollHeight]
 * @prop {  Array<RouteWithBadge> } [routes]
 * @prop { SxProps<Theme> } [sxTabBox]
 */
export type TabsLayoutProps = {
  title: string;
  titleComponent?: React.ReactNode;
  additionalScrollHeight?: number;
  routes?: Array<RouteWithBadge>;
  sxTabBox?: SxProps<Theme>;
};

/**
 * Main Tabs Page Layout
 *
 * @param { TabsLayoutProps } props
 */
export const TabsLayout: React.FC<TabsLayoutProps> = (props) => {
  const location = useLocation();

  const { title, titleComponent, routes } = props;
  // Setting first route as active tab
  const [value, setValue] = useState<string | number>(getPath());
  const [scrollReset, setScrollReset] = useState(true);
  const htmlId = slugify(title);

  function getPath() {
    const path = location.pathname.split('/').pop();
    return routes?.find((route) => route.path === path)?.path as string;
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setScrollReset(!scrollReset);
    setValue(newValue);
  };

  const displayTitle = useMemo(() => {
    if (titleComponent) {
      return titleComponent;
    }
    return title;
  }, [title, titleComponent]);

  useEffect(() => {
    setValue(getPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Box id={`${htmlId}-section`} data-testid={`tabs-section`} component="section" sx={{ width: '100%' }}>
      <Typography data-testid={`${htmlId}-section-title`} variant="h4">
        {displayTitle}
      </Typography>
      <Box data-testid={`${htmlId}-layout-box`} sx={{ borderBottom: 1, borderColor: 'divider', ...props.sxTabBox }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" aria-label="basic tabs example">
          {routes
            ? routes
                .filter((route) => !route.index)
                .map((route, i) => (
                  <Tab
                    data-testid={`tab-${route.path}`}
                    key={i}
                    label={
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 2,
                          justifyItems: 'center',
                        }}
                      >
                        {route.label}{' '}
                        {route.badgeContent && <Chip label={route.badgeContent} color="primary" size="small" />}
                      </Box>
                    }
                    value={route.path}
                    LinkComponent={NavLink}
                    to={route.path}
                    {...a11yProps(htmlId, i)}
                  />
                ))
            : null}
        </Tabs>
      </Box>
      <Box
        component="div"
        data-testid={`tab-panel-${value}`}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        sx={{ py: 4 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
