import { useMemo, useState } from 'react';

import { Paper, Tab, Tabs, Typography } from '@mui/material';

import { ScrollableLayout } from '@ai2c/pmx-mui';

import { useGetRoleRequestsByUserIdQuery } from '@store/griffin_api/users/slices/roleRequestApi';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

import CurrentPermissionsTab from './CurrentPermissionsTab';
import InformationSection from './InformationSection';
import RequestPermissionsTab from './RequestPermissionsTab';

/* Account Management View */
const AccountManagement: React.FC = () => {
  /* ***************************
    State Variable Declaration
    *************************** */
  const appUser = useAppSelector(selectAppUser);
  const { data: roleRequestData } = useGetRoleRequestsByUserIdQuery({ userId: appUser.userId });
  const [activeTab, setActiveTab] = useState(0);

  /* ***************************
    Use Effect and Use Memos
    *************************** */
  const userRequestCount = useMemo(() => {
    if (!roleRequestData) {
      return 0;
    } else {
      return roleRequestData.length;
    }
  }, [roleRequestData]);

  /* ***************************
    Handle Functions
    *************************** */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  /* ***************************
    UI Component
    *************************** */
  return (
    <ScrollableLayout title="Account Management">
      <InformationSection />
      <Paper elevation={1} aria-label="Permission Information" sx={{ width: '100%', mb: 2 }}>
        <Typography variant="h6" sx={{ px: 3, pt: 3, pb: 1 }}>
          User Permissions
        </Typography>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Current" aria-label="View Permissions Tab" sx={{ ml: 2 }} />
          <Tab label={`Requests (${userRequestCount})`} aria-label="Request Permissions Tab" />
        </Tabs>
        <CurrentPermissionsTab activeTab={activeTab} index={0} />
        <RequestPermissionsTab activeTab={activeTab} index={1} roleRequestData={roleRequestData ?? []} />
      </Paper>
    </ScrollableLayout>
  );
};

export default AccountManagement;
