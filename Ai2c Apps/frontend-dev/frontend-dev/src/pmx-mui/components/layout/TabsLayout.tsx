import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, RouteObject, useLocation } from 'react-router-dom';

import { SxProps, Theme, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { CLASSIFICATION_BANNER_HEIGHT, TOOLBAR_HEIGHT } from '../../constants';
import { slugify, titlecase } from '../../helpers';
import { useClassificationContext } from './MainLayout';
import { ScrollableArea } from './ScrollableArea';

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
 * @prop {  Array<RouteObject> } [routes]
 * @prop { SxProps<Theme> } [sxTabBox]
 */
export type TabsLayoutProps = {
  title: string;
  titleComponent?: React.ReactNode;
  additionalScrollHeight?: number;
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

  const { title, titleComponent, routes, additionalScrollHeight = 0 } = props;
  // Setting first route as active tab
  const [value, setValue] = useState<string | number>(getPath());
  const [scrollReset, setScrollReset] = useState(true);
  const htmlId = slugify(title);
  const theme = useTheme();
  const hasClassification = useClassificationContext();
  // height = 100% view height - (toolbar height + padding  + h4 height) or
  // height = 100% view height - (toolbar height + classification banner height + padding  + h4 height)
  const padding = '60px';
  const tabHeight = '48px';
  const headingFourLineHeight = theme.typography.h4.lineHeight;
  const scrollAreaHeight = `calc(100vh - ${additionalScrollHeight}px - ${hasClassification ? TOOLBAR_HEIGHT + CLASSIFICATION_BANNER_HEIGHT : TOOLBAR_HEIGHT}px - ${headingFourLineHeight} - ${padding} - ${tabHeight})`;

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
                    label={<Typography variant="h6">{titlecase(route.label)}</Typography>}
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
        <ScrollableArea height={scrollAreaHeight} scrollReset={scrollReset}>
          <Outlet />
        </ScrollableArea>
      </Box>
    </Box>
  );
};
