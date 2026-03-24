import React from 'react';

import InsightCard from '@features/maintenance-schedule/components/PhaseFlow/Insights/InsightCard';

interface CompanySamePhaseInsightProps {
  company: string;
  serial1: string;
  serial2: string;
}

/**
 * Insight about two aircraft in the same company having phase nex to each other <5 hours
 * @param {ClosePhaseInsightProps} props
 * @param {string} props.company - company name
 * @param {string} props.serial1 - serial of 1 of the 2 aircraft
 * @param {string} props.serial1 - serial of 2 of the 2 aircraft
 * @returns JSX element
 */

const CompanySamePhaseInsight: React.FC<CompanySamePhaseInsightProps> = ({
  company,
  serial1,
  serial2,
}: CompanySamePhaseInsightProps) => {
  return (
    <InsightCard
      title="Schedule Maintenance"
      message={`${company} aircraft ${serial1} and ${serial2} are predicted to enter phase at the same time.`}
      insightNumber={3}
      data-testid={`close-phase-for-comp-insight`}
    />
  );
};

export default CompanySamePhaseInsight;
