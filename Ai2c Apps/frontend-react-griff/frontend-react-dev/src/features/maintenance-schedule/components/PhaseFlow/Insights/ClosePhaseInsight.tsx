import React from 'react';

import InsightCard from '@features/maintenance-schedule/components/PhaseFlow/Insights/InsightCard';

interface ClosePhaseInsightProps {
  serial1: string;
  serial2: string;
}

/**
 * Insight about aircraft that are 5 hours to phase from each other.
 * @param {ClosePhaseInsightProps} props
 * @param {string} props.serial1 - serial of 1 of the 2 aircraft
 * @param {string} props.serial1 - serial of 2 of the 2 aircraft
 * @returns JSX element
 */

const ClosePhaseInsight: React.FC<ClosePhaseInsightProps> = ({
  serial1,
  serial2,
}: ClosePhaseInsightProps): JSX.Element => {
  return (
    <InsightCard
      title="Schedule Maintenance"
      message={`${serial1} and ${serial2} are predicted to go into phase within 5 flight hours of each other. Recommend staggering aircraft.`}
      insightNumber={2}
      data-testid={`close-phase-insight`}
    />
  );
};

export default ClosePhaseInsight;
