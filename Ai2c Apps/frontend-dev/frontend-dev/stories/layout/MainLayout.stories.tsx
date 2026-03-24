// import { MemoryRouter, redirect, Route, RouteObject, Routes } from 'react-router-dom';

// import HomeIcon from '@mui/icons-material/Home';
// import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
// import { Badge } from '@mui/material';
// import type { Meta, StoryObj } from '@storybook/react';

// import { MainLayout } from '../../components/layout';
// import { GriffinBeakIcon } from '../../icons';
// import { Classification } from '../../models/Classification';

// const childRoutes: Array<RouteObject> = [
//   { index: true, label: 'index', path: '', loader: () => redirect('/page-1') },
//   {
//     label: 'Home',
//     path: '/',
//     element: null,
//     icon: <HomeIcon />,
//   },
//   {
//     label: 'Page 1',
//     path: 'page-1',
//     element: <div>Page 1</div>,
//     icon: <GriffinBeakIcon />,
//   },
//   {
//     label: 'Page 2',
//     path: 'page-2',
//     element: <div>Page 2</div>,
//     icon: <GriffinBeakIcon />,
//   },
// ];

// const meta: Meta<typeof MainLayout> = {
//   title: 'Components/Layout/MainLayout',
//   component: MainLayout,
//   parameters: {
//     layout: 'fullscreen',
//   },
//   decorators: [
//     (Story) => (
//       <MemoryRouter initialEntries={['/page-1']}>
//         <Routes>
//           <Route path="/*" element={<Story />} />
//         </Routes>
//       </MemoryRouter>
//     ),
//   ],
// };

// export default meta;
// type Story = StoryObj<typeof MainLayout>;

// export const Primary: Story = {
//   args: {
//     title: 'Example App',
//     routes: childRoutes,
//     appIcon: <GriffinBeakIcon />,
//     classification: Classification.UNCLASSIFIED,
//     mainNavPlacement: 'left',
//   },
// };

// export const WithDrawer: Story = {
//   args: {
//     ...Primary.args,
//     leftDrawer: <div style={{ padding: '1rem' }}>Drawer Content</div>,
//     leftDrawerOpen: true,
//   },
// };

// export const WithCustomAppBar: Story = {
//   args: {
//     ...Primary.args,
//     appBarLeft: <div>Left Content</div>,
//     appBarCenter: <div>Center Content</div>,
//     appBarRight: <div>Right Content</div>,
//   },
// };

// export const WithBottomRoutes: Story = {
//   args: {
//     ...Primary.args,
//     bottomRoutes: [
//       {
//         label: 'User Management',
//         path: '/user-management',
//         element: <div>User Management Page</div>,
//         icon: <ManageAccountsIcon />,
//       },
//     ],
//   },
// };

// export const WithBottomBadge: Story = {
//   args: {
//     ...Primary.args,
//     bottomRoutes: [
//       {
//         label: 'User Management',
//         path: '/user-management',
//         element: null,
//         icon: (
//           <Badge
//             color="error"
//             variant="dot"
//             sx={{ '& .MuiBadge-badge': { height: '12px', width: '12px', borderRadius: '6px' } }}
//           >
//             <ManageAccountsIcon />
//           </Badge>
//         ),
//       },
//     ],
//   },
// };
