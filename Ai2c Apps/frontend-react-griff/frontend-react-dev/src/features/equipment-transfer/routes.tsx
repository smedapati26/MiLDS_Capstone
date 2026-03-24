import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

import { TabsLayoutProps } from '@ai2c/pmx-mui/components/layout/TabsLayout';

import { BadgeTabsLayout } from '@components/utils/BadgeTabsLayout';

import { useGetTransferRequestsQuery } from '@store/griffin_api/auto_dsr/slices/transferRequestsApi';
import { useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

const TransferTab = lazy(() => import('./Transfer/TransferTab'));
const RequestsTab = lazy(() => import('./Requests/RequestsTab'));
const AircraftComponent = lazy(() => import('./Transfer/Aircraft/AircraftTransferTab'));
const UASComponent = lazy(() => import('./Transfer/UAS/UASComponent'));
const AGSEComponent = lazy(() => import('./Transfer/AGSE/AGSEComponent'));

export const equipmentTransferRoutes: Array<RouteObject> = [
  { index: true, label: 'equipment-transfer-index', path: '', loader: () => redirect('transfer') },
  {
    label: 'Transfer',
    path: 'transfer',
    element: <TransferTab />,
    children: [
      { index: true, label: 'transfer-index', loader: () => redirect('aircraft') },
      { label: 'Aircraft', path: 'aircraft', element: <AircraftComponent /> },
      { label: 'UAS', path: 'uas', element: <UASComponent /> },
      { label: 'AGSE', path: 'agse', element: <AGSEComponent /> },
    ],
  },
  { label: 'Requests', path: 'requests', element: <RequestsTab /> },
];

/**
 * Equipment Transfer Tabs Layout
 * Equipment Transfer Tabs Layout Component to add in Request Tab with Notification Badge.
 *
 * @param { TabsLayoutProps } props
 */

export const EquipmentTransferTabsLayout = ({ title, routes = equipmentTransferRoutes }: TabsLayoutProps) => {
  const badgeRoutes = ['requests'];

  const appUser = useAppSelector(selectAppUser);
  const { data: elevatedRoles } = useGetUserElevatedRolesQuery(appUser.userId);
  const { data: equipmentTransferRequests } = useGetTransferRequestsQuery(undefined);

  const adminUics = elevatedRoles?.admin || [];
  const data = equipmentTransferRequests?.filter((request) => adminUics.includes(request.destinationUic)) ?? [];

  return (
    <BadgeTabsLayout
      title={title}
      routes={routes}
      badgeRoutes={badgeRoutes}
      badgeCount={data ? data.length : 0}
      displayCount={false}
    />
  );
};
