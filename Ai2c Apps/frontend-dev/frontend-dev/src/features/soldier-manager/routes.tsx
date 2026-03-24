import { lazy } from 'react';
import { redirect } from 'react-router-dom';

import { RouteWithBadge } from '@components/layout';

const ManageTab = lazy(() => import('./components/tabs/ManageTab'));
const RequestsTab = lazy(() => import('./components/tabs/RequestsTab'));
const TransferTab = lazy(() => import('./components/tabs/TransferTab'));

export const soldierManagerRoutes = (transferRequestsCount: number = 0): Array<RouteWithBadge> => {
  return [
    { index: true, label: 'soldier-manager-index', path: '', loader: () => redirect('manage') },
    { label: 'Manage', path: 'manage', element: <ManageTab /> },
    { label: 'Transfer', path: 'transfer', element: <TransferTab /> },
    { label: 'Requests', path: 'request', element: <RequestsTab />, badgeContent: transferRequestsCount },
  ];
};
