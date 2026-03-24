import { MemoryRouter, redirect, Route, RouteObject, Routes } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/react';

import { MainLayout, TabsLayout } from '../../components/layout';
import { pmxPalette } from '../../theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '../../theme/PmxThemeContextProvider';

const tabRoutes: Array<RouteObject> = [
  { index: true, label: 'index', path: '', loader: () => redirect('tab-1') },
  {
    label: 'Tab 1',
    path: 'tab-1',
    element: <Box data-testid="tab-1-div">Tab 1</Box>,
  },
  {
    label: 'Tab 2',
    path: 'tab-2',
    element: <Box data-testid="tab-1-div">Tab 1</Box>,
  },
  {
    label: 'Tab 3',
    path: 'tab-3',
    element: <Box data-testid="tab-1-div">Tab 1</Box>,
  },
];

const routes: Array<RouteObject> = [
  {
    path: '/',
    label: 'app-root',
    element: <TestingComponent />,
    children: [
      {
        index: true,
        label: 'Tabs Layout',
        path: '',
        element: <TabsLayout sxTabBox={{ borderBottom: 'none' }} title="Tabs Layout" routes={tabRoutes} />,
      },
    ],
  },
];

function TestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);

  return (
    <Box data-testid="test-component" component="div">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <MainLayout title="TEST" routes={routes} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

const meta: Meta<typeof TabsLayout> = {
  title: 'Components/Layout/TabsLayout',
  component: TabsLayout,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tab-1']}>
        <Routes>
          <Route path="/*" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabsLayout>;

export const Primary: Story = {
  args: {
    title: 'Tabs Layout',
    routes: tabRoutes,
    sxTabBox: { borderBottom: 'none' },
  },
};
