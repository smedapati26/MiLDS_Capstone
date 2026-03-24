import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, RouteObject, useLocation } from 'react-router-dom';

import { SxProps, Theme, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { slugify } from '../../helpers';
import { ScrollableArea } from './ScrollableArea';

/**
 * a11yProps
 * @param { string } idPrefix
 * @param { string } index
 * @returns { React.HTMLProps }
 */

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
 * @prop {  Array<RouteObject> } [routes]
 * @prop { SxProps<Theme> } [sxTabBox]
 */
export type TabsLayoutProps = {
  title: string;
  titleComponent?: React.ReactNode;
  routes?: Array<RouteObject>;
  sxTabBox?: SxProps<Theme>;
  sxTab?: SxProps<Theme>;
  children?: React.ReactNode;
};

/**
 * Main Tabs Page Layout
 *
 * @param { TabsLayoutProps } props
 */
export const TabsLayout: React.FC<TabsLayoutProps> = (props: TabsLayoutProps) => {
  const location = useLocation();

  const { title, titleComponent, routes } = props;
  // Setting first route as active tab
  const getPath = useCallback(() => {
    const path = location.pathname.split('/').pop();
    return routes?.find((route) => route.path === path)?.path as string;
  }, [location.pathname, routes]);

  const [value, setValue] = useState<string | number>(getPath());
  const [scrollReset, setScrollReset] = useState(true);
  const htmlId = slugify(title);

  // On Tab Change reset scroll to to
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
  }, [getPath, location.pathname]);

  return (
    <Box id={`${htmlId}-section`} data-testid={`${htmlId}-section`} component="section" sx={{ width: '100%' }}>
      <Typography data-testid={`${htmlId}-section-title`} variant="h4">
        {displayTitle}
      </Typography>
      {props.children}
      <Box data-testid={`${htmlId}-layout-box`} sx={{ ...props.sxTabBox }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" aria-label="basic tabs example">
          {routes
            ? routes
                .filter((route) => !route.index)
                .map((route, i) => (
                  <Tab
                    data-testid={`tab-${route.path}`}
                    key={i}
                    label={<Typography variant="h6">{route.label}</Typography>}
                    value={route.path}
                    LinkComponent={NavLink}
                    to={route.path}
                    {...a11yProps(htmlId, i)}
                    sx={{ textTransform: 'none', ...props.sxTab }}
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
        <ScrollableArea scrollReset={scrollReset}>
          <Outlet />
        </ScrollableArea>
      </Box>
    </Box>
  );
};
