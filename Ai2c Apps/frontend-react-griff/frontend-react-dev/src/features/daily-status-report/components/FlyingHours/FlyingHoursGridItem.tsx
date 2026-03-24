import { Divider, Stack } from '@mui/material';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import { useGetFlyingHoursQuery } from '@store/griffin_api/auto_dsr/slices';

import { ProgressStats } from './ProgressStats';

/**
 * FlyingHoursGridItem Component
 *
 * A grid item component that displays flying hours progress for both monthly and yearly requirements.
 * This component fetches flying hours data from the API and renders two side-by-side progress indicators
 * showing completion status for different time periods.
 *
 * @param uic { string } // Used to make DSR api call
 * @returns JSX element containing the flying hours grid item with progress statistics
 */
const FlyingHoursGridItem: React.FC<{ uic: string; higherEchelonUic?: string }> = ({
  uic,
  higherEchelonUic,
}: {
  uic: string;
  higherEchelonUic?: string;
}) => {
  // Fetch flying hours data from API with RTK Query
  // Skip query execution if no UIC is available
  const { data, isError, isFetching, isUninitialized, refetch } = useGetFlyingHoursQuery(
    {
      uic: uic,
    },
    { skip: !uic }, // Conditional fetching - only fetch when UIC exists
  );

  const { data: higherEchelonData } = useGetFlyingHoursQuery(
    {
      uic: higherEchelonUic,
    },
    { skip: !higherEchelonUic }, // Conditional fetching - only fetch when UIC exists
  );

  return (
    <PmxGridItemTemplate
      label="Flying Hours"
      isError={isError} // Pass error state to template for error handling
      isFetching={isFetching} // Pass loading state to template for skeleton display
      isUninitialized={isUninitialized || !uic} // Pass uninitialized state to template
      refetch={refetch} // Pass refetch function for retry functionality
      launchPath="/flight-hour-program" // Navigation path for detailed view
      minHeight="240px"
    >
      {/* Conditional rendering - only show content when data is available */}
      {data ? (
        <Stack
          direction="row" // Horizontal layout for side-by-side progress stats
          spacing={4} // Consistent spacing between progress components
          sx={{ flexGrow: 1 }} // Take full available width
          divider={<Divider orientation="vertical" flexItem />} // Visual separator between stats
        >
          {/* Monthly flying hours progress indicator */}
          <ProgressStats
            label={`Monthly ${!higherEchelonData ? 'Requirements' : ''}`}
            hours={data.monthlyHoursFlown} // Current month's completed hours
            totalHours={higherEchelonData ? higherEchelonData.monthlyHoursTotal : data.monthlyHoursTotal} // Required monthly hours
          />

          {/* Yearly flying hours progress indicator */}
          <ProgressStats
            label={`Yearly ${!higherEchelonData ? 'Requirements' : ''}`}
            hours={data.yearlyHoursFlown} // Current year's completed hours
            totalHours={higherEchelonData ? higherEchelonData.yearlyHoursTotal : data.yearlyHoursTotal} // Required yearly hours
          />
        </Stack>
      ) : null}
    </PmxGridItemTemplate>
  );
};

export default FlyingHoursGridItem;
