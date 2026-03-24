import React from 'react';

import InsightCard from '@features/maintenance-schedule/components/PhaseFlow/Insights/InsightCard';
import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

interface ScheduleConflictInsightProps {
  serial: string;
  hoursToPhase: number;
}

/**
 * insight about aircraft that needs to be set to phase since they are <50 hours
 * @param {ScheduleConflictInsightProps} props
 * @param {string} props.serial - of aircraft to schedule to phase
 * @param {number} props.hoursToPhase - the number of hours left to phase
 * @returns
 */

const ScheduleConflictInsight: React.FC<ScheduleConflictInsightProps> = ({
  serial,
  hoursToPhase,
}: ScheduleConflictInsightProps): JSX.Element => {
  const { getFamilyPhaseHours } = usePhaseFlowContext();
  let message = '';
  if (hoursToPhase >= 0) {
    message = `is due for phase in ${hoursToPhase.toFixed(0)} flight hours and needs to be scheduled.`;
  } else if (hoursToPhase >= getFamilyPhaseHours() * -0.1) {
    message = `is due for phase in ${(hoursToPhase - getFamilyPhaseHours() * -0.1).toFixed(0)} flight hours and needs to be scheduled.`;
  } else {
    message = `is overdue for phase by ${(getFamilyPhaseHours() * -0.1 - hoursToPhase).toFixed(0)} flight hours and needs to be scheduled.`;
  }

  return (
    <InsightCard
      title="Schedule Maintenance"
      message={`${serial} ${message}`}
      insightNumber={1}
      data-testid={`schedule-phase-insight`}
    />
  );
};

export default ScheduleConflictInsight;
