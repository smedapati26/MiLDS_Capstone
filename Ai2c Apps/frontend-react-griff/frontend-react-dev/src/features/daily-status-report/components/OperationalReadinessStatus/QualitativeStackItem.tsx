import Box from '@mui/material/Box';

import useOrStatusColor from '@hooks/useOrStatusColor';
import { generateTestId } from '@utils/helpers/generateTestId';

import { IStatusStatInfo } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

/**
 * Qualitative Stack Item for Custom Horizontal Stack Bare
 */
export const QualitativeStackItem: React.FC<{ statInfo: IStatusStatInfo }> = (props: { statInfo: IStatusStatInfo }) => {
  const { statInfo } = props;
  const backgroundColor = useOrStatusColor(statInfo.status);

  return (
    <Box
      data-testid={generateTestId(statInfo.status, 'operational-readiness-status', true)}
      sx={{
        height: '25px',
        width: `${statInfo.percentage * 100}%`,
        backgroundColor: backgroundColor,
        borderRadius: '3px',
      }}
    />
  );
};
