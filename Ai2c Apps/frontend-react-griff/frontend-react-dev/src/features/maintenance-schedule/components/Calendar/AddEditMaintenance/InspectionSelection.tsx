import React, { Fragment, ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

import PmxButtonGroupSelector, { IToggleOption } from '@components/PmxButtonGroupSelector';

interface InspectionSelectionProps {
  options: IToggleOption<number>[];
  selectedInspection: string[] | number;
  setSelectedInspection: (values: string[]) => void;
}

/**
 * Creates the inspections to be selected
 * @param {IToggleOption<number>[]} options - aircraft dsr value received from backend
 * @param {string[]} selectedInspection - list of inspections selected by user
 * @param {Function(T[]: void)} setSelectedInspection - function to set the selected inspection
 * @returns {ReactNode} the rendered function
 */

/** */
const InspectionSelection: React.FC<InspectionSelectionProps> = ({
  options,
  selectedInspection,
  setSelectedInspection,
}: InspectionSelectionProps): ReactNode => {
  // slice into two groups for rendering
  const upcomingGroup = options.slice(0, 3); // upcoming is top three
  const otherGroup = options.slice(3);

  return (
    <Box>
      {options?.length === 0 ? (
        <Typography variant="body3">No upcoming inspections found.</Typography>
      ) : (
        <Fragment>
          <Typography variant="body1" mt={4} mb={4}>
            Select maintenance(s) to schedule
          </Typography>
          {upcomingGroup.length > 0 && (
            <PmxButtonGroupSelector
              selected={selectedInspection}
              setSelected={setSelectedInspection}
              options={upcomingGroup}
              label="Upcoming"
              exclusive
            />
          )}
          {otherGroup.length > 0 && (
            <PmxButtonGroupSelector
              selected={selectedInspection}
              setSelected={setSelectedInspection}
              options={otherGroup}
              label="Other"
              exclusive
            />
          )}
        </Fragment>
      )}
    </Box>
  );
};

export default InspectionSelection;
