import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Box, Tooltip, Typography } from '@mui/material';

import { PmxIconLink } from '@components/PmxIconLink';
import { ISoldier } from '@store/amap_ai/soldier';

export const currentPermissionsColumn = [
  {
    field: 'unit',
    header: 'Unit',
  },
  {
    field: 'permission',
    header: 'Permissions',
  },
];

export const requestPermissionsColumns = [
  {
    field: 'unit',
    header: 'Unit',
  },
  {
    field: 'permission',
    header: 'Permissions',
    renderCell: (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : ''),
  },
  {
    field: 'approvers',
    header: 'Approver(s)',
    renderCell: (users: ISoldier[]) => {
      if (!users || users.length === 0) return null;

      const fullNames = users.map((u) => `${u.rank} ${u.firstName} ${u.lastName}`).join(', ');

      return (
        <Tooltip title={fullNames}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {users.map((u, idx) => {
              const name = `${u.rank} ${u.firstName} ${u.lastName}`;
              const suffix = idx === users.length - 1 ? '' : ',';

              if (u.dodEmail) {
                return (
                  <PmxIconLink
                    key={u.userId}
                    ComponentIcon={MailOutlineIcon}
                    text={name + suffix}
                    onClick={() => {
                      window.location.href = `mailto:${u.dodEmail}`;
                    }}
                  />
                );
              }

              return <Typography key={u.userId}>{name + suffix}</Typography>;
            })}
          </Box>
        </Tooltip>
      );
    },
  },
];
