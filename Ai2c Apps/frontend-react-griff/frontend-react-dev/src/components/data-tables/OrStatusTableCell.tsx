import { CSSProperties } from 'react';

import { Box } from '@mui/material';

import useDataDisplayTagColor from '@hooks/useDataDisplayTagColor';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

/**
 * Props interface for the OrStatusTableCell component
 */
export type Props = {
  /** The operational readiness status of the equipment */
  status: OperationalReadinessStatusEnum | string;
  /** The number of days the equipment has been down/non-operational */
  downDateCount?: number;
  sx?: CSSProperties;
};

/**
 * OrStatusTableCell - A styled component for displaying equipment operational readiness status
 *
 * This component renders a colored box that displays the operational readiness status of equipment.
 * It provides visual feedback through color-coding and includes additional information such as
 * the number of days the equipment has been down when applicable.
 *
 * @param props - The component props
 * @returns A styled Box component displaying the operational readiness status
 */
export const OrStatusTableCell: React.FC<Props> = ({ status, downDateCount, sx }: Props) => {
  // Normalize NMCM statuses to display as a single "NMCM" status
  // This consolidates various maintenance-related statuses for cleaner display
  const orStatus = status;

  // Get the themed background color based on the status
  // This hook provides color-coding for different operational readiness statuses
  const { color, backgroundColor } = useDataDisplayTagColor(orStatus);

  return (
    <Box
      sx={{
        // Center the content both horizontally and vertically
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Text color to ensure readability against the background
        color: color,
        // Apply the themed background color based on status
        backgroundColor: backgroundColor,
        // Rounded corners for a modern appearance
        borderRadius: '3px',
        // Internal spacing for better readability
        padding: 1,
        // Max-width for flex
        maxWidth: '120px',
        ...sx,
      }}
    >
      {/* 
        Display the status with optional down date count
        If equipment has been down for more than 0 days, show both status and count
        Otherwise, show only the status
      */}
      {downDateCount &&
      downDateCount > 0 &&
      (orStatus === 'PMCM' ||
        orStatus === 'PMCS' ||
        orStatus === 'MOC' ||
        orStatus === 'NMCM' ||
        orStatus === 'NMCS' ||
        orStatus === 'DADE')
        ? `${orStatus} | ${downDateCount}`
        : orStatus}
    </Box>
  );
};
