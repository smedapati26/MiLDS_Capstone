import { Stack, Typography, useTheme } from '@mui/material';
import Badge from '@mui/material/Badge';

import useOrStatusColor from '@hooks/useOrStatusColor';
import { generateTestId } from '@utils/helpers/generateTestId';

import { IStatusStatInfo } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

/**
 * OperationalReadinessStat
 * @description Operational Readiness Stat for each status
 */
export const OperationalReadinessStat: React.FC<{ statInfo: IStatusStatInfo; totalAircraft: number }> = (props: {
  statInfo: IStatusStatInfo;
  totalAircraft: number;
}) => {
  const { statInfo, totalAircraft } = props;
  const theme = useTheme();
  const backgroundColor = useOrStatusColor(statInfo.status);

  return (
    <Stack
      data-testid={generateTestId(statInfo.status, 'operational-readiness-status', true)}
      spacing={4}
      flexBasis="100%"
    >
      {/** Legend color badge */}
      <Badge
        badgeContent=""
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: backgroundColor,
            top: theme.spacing(2),
            left: theme.spacing(2),
            minWidth: theme.spacing(3),
            height: theme.spacing(3),
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {/** Aircraft Status */}
        <Typography variant="body2" sx={{ marginLeft: theme.spacing(6) }}>
          {statInfo.status}
        </Typography>
      </Badge>
      {/** Aircraft Status Percentage */}
      <Typography
        data-testid={generateTestId(
          `${statInfo.status.toLocaleLowerCase()}-percentage`,
          'operational-readiness-status',
          true,
        )}
        variant="body1"
      >
        {Math.round(statInfo.percentage * 100)}%
      </Typography>
      {/** Aircraft ratio */}
      <Stack direction="row" spacing={1}>
        <Typography variant="body1">{statInfo.count}</Typography>
        <Typography variant="body1">/</Typography>
        <Typography variant="body1">{totalAircraft} aircraft</Typography>
      </Stack>
    </Stack>
  );
};
