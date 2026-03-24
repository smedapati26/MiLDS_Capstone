import { Divider, Stack } from '@mui/material';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';
import { generateTestId } from '@utils/helpers/generateTestId';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

import { OperationalReadinessStat } from './OperationalReadinessStat';
import { QualitativeStackItem } from './QualitativeStackItem';

/* OperationalReadinessStatusGridItem Props */
export type OperationalReadinessStatusGridItemProps = {
  uic: string | undefined;
  startDate: string;
  endDate: string;
};

/**
 * Operational Readiness Status Grid Item
 * @description Custom horizontal stacked bar graph with Aircraft status statistics
 * @param props OperationalReadinessStatusGridItemProps
 * @returns React.FC
 */
const OperationalReadinessStatusGridItem: React.FC<OperationalReadinessStatusGridItemProps> = (
  props: OperationalReadinessStatusGridItemProps,
) => {
  const label = 'Operational Readiness Status';
  const { uic, startDate, endDate } = props;

  const { data, isError, isFetching, isUninitialized, refetch } = useGetAutoDsrQuery(
    {
      uic: uic,
      start_date: startDate,
      end_date: endDate,
    },
    { skip: !uic }, // Skips API call if UIC has not been set
  );

  return (
    <PmxGridItemTemplate
      label={label}
      isError={isError}
      isFetching={isFetching}
      isUninitialized={isUninitialized || !uic}
      refetch={refetch}
      launchPath="/readiness-analytics"
      minHeight={'208px'}
    >
      {/** Custom Horizontal Stacked Bar for Aircraft Status */}
      <Stack data-testid={generateTestId(label, 'horizontal-stacked-bar')} direction="row" spacing={1} sx={{ mb: 5 }}>
        {data
          ? data.aircraftStatusStats.map((statusStatInfo) =>
              statusStatInfo.count !== 0 ? (
                <QualitativeStackItem key={`${statusStatInfo.status}-stack-bar`} statInfo={statusStatInfo} />
              ) : null,
            )
          : null}
      </Stack>

      {/* Aircraft Status Details */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={3}
        divider={<Divider orientation="vertical" flexItem />}
      >
        {/** Aircraft Status Information */}
        {data
          ? data.aircraftStatusStats.map((statusStatInfo) => (
              <OperationalReadinessStat
                key={`${statusStatInfo.status}-stat-info`}
                statInfo={statusStatInfo}
                totalAircraft={data.totalAircraft}
              />
            ))
          : null}
      </Stack>
    </PmxGridItemTemplate>
  );
};

export default OperationalReadinessStatusGridItem;
