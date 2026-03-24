import { lazy } from 'react';
import { Outlet, redirect, RouteObject } from 'react-router-dom';

const CreateTaskForceTab = lazy(() => import('./pages/CreateTaskForceTab'));
const TaskForcesTab = lazy(() => import('./pages/TaskForcesTab'));
const TaskForceDetailsTab = lazy(() => import('./pages/TaskForceDetailsTab'));

export const taskForcesRoutes: Array<RouteObject> = [
  { index: true, label: 'task-forces-index', path: '', loader: () => redirect('create') },
  { label: 'Create New', path: 'create', element: <CreateTaskForceTab /> },
  {
    label: 'My Task Forces',
    path: 'list',
    element: <Outlet />,
    children: [
      {
        index: true,
        label: 'Task Forces',
        path: '',
        element: <TaskForcesTab archived={false} />,
      },
      {
        label: 'Task Force Details',
        path: ':uic',
        element: <TaskForceDetailsTab />,
      },
    ],
  },
  {
    label: 'Archived Task Forces',
    path: 'archived',
    element: <Outlet />,
    children: [
      {
        index: true,
        label: 'Task Forces',
        path: '',
        element: <TaskForcesTab archived={true} />,
      },
      {
        label: 'Task Force Details',
        path: ':uic',
        element: <TaskForceDetailsTab />,
      },
    ],
  },
];
