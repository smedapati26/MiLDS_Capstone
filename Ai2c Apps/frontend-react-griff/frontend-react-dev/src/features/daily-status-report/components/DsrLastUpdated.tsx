import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax);

import { useMemo } from 'react';

import { LastUpdated } from '@components/data-tables';
import { IOptions } from '@models/IOptions';
import { QUERY_DATE_FORMAT } from '@utils/constants';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

/**
 * DsrLastUpdated Functional Component
 */
export const DsrLastUpdated: React.FC = () => {
  const currentUic = useAppSelector(selectCurrentUic);
  const startDate = dayjs().startOf('month').format(QUERY_DATE_FORMAT);
  const endDate = dayjs().endOf('month').format(QUERY_DATE_FORMAT);

  // Api call
  const { data: dsrData } = useGetAutoDsrQuery(
    {
      uic: currentUic,
      start_date: startDate,
      end_date: endDate,
    },
    { skip: !currentUic }, // Skips API call if UIC has not been set
  );

  const { latestUpdates, latestDatetime } = useMemo(() => {
    if (!dsrData || !dsrData.data || dsrData.data.length === 0) {
      return {
        latestUpdates: [],
        latestDatetime: null,
      };
    }

    // Filter valid dates for each type
    const validExportTimes = dsrData.data.map((row) => dayjs(row.lastExportUploadTime)).filter((d) => d.isValid());
    const validSyncTimes = dsrData.data.map((row) => dayjs(row.lastSyncTime)).filter((d) => d.isValid());
    const validUserEditTimes = dsrData.data.map((row) => dayjs(row.lastUserEditTime)).filter((d) => d.isValid());

    // Get max for each, or null if no valid dates
    const latestExportUploadTime = validExportTimes.length > 0 ? dayjs.max(validExportTimes) : null;
    const latestSyncTime = validSyncTimes.length > 0 ? dayjs.max(validSyncTimes) : null;
    const latestUserEditTime = validUserEditTimes.length > 0 ? dayjs.max(validUserEditTimes) : null;

    // Filter out null values and find the latest date
    const validLatestTimes = [latestExportUploadTime, latestSyncTime, latestUserEditTime].filter((d) => d !== null);
    const latestDate = validLatestTimes.length > 0 ? dayjs.max(validLatestTimes) : null;

    const latestUpdates: Array<IOptions> = [
      {
        label: 'Latest Export:',
        value: latestExportUploadTime ? latestExportUploadTime.format('MM/DD/YYYY HH:mm:ss') : '',
      },
      {
        label: 'Latest Sync:',
        value: latestSyncTime ? latestSyncTime.format('MM/DD/YYYY HH:mm:ss') : '',
      },
      {
        label: 'Latest User Edit:',
        value: latestUserEditTime ? latestUserEditTime.format('MM/DD/YYYY HH:mm:ss') : '',
      },
    ];

    return {
      latestUpdates,
      latestDatetime: latestDate ? latestDate : null,
    };
  }, [dsrData]);

  return <LastUpdated lastUpdateDate={latestDatetime} extraUpdates={latestUpdates} />;
};
