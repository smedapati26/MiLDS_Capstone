import React from 'react';

import { Container, Skeleton, SxProps, Theme } from '@mui/material';

import { generateTestId } from '@utils/helpers/generateTestId';

import { PmxLaunchHeading } from './inputs';
import { PmxErrorDisplay } from './PmxErrorDisplay';

// ContainerBody component to wrap children with a container and optional label
const ContainerBody: React.FC<{
  children: React.ReactNode;
  label: string | undefined;
  launchPath?: string | undefined;
  sx?: SxProps<Theme>;
}> = ({ children, label, launchPath, sx }) => (
  <Container
    data-testid={generateTestId(label, 'grid-item')}
    maxWidth={false}
    disableGutters
    sx={{ width: '100%', minHeight: '100%', py: 4, px: 3, display: 'flex', flexDirection: 'column', ...sx }}
  >
    <PmxLaunchHeading heading={label} path={launchPath} />
    {children}
  </Container>
);

interface PmxGridItemTemplateProps {
  isError?: boolean; // Indicates if there was an error fetching the data
  isFetching?: boolean; // Indicates if the data is currently being fetched
  isUninitialized?: boolean; // Indicates if the data fetching has not been initialized
  refetch?: () => void; // Function to refetch the data
  label?: string; // The label to be displayed in the ContainerBody component
  children?: React.ReactNode; // The content to be displayed when data is successfully fetched
  minHeight?: string; // Sets the min-height CSS prop on Skeleton & container
  sx?: SxProps<Theme>; // to have or remove minHeight
  launchPath?: string | undefined; // Displays the Launch Button and routes on path
}

/**
 * PmxGridItemTemplate component renders different UI elements based on the state of data fetching.
 *
 * @param {boolean} isError - Indicates if there was an error fetching the data.
 * @param {boolean} isFetching - Indicates if the data is currently being fetched.
 * @param {boolean} isUninitialized - Indicates if the data fetching has not been initialized.
 * @param {() => void} refetch - Function to refetch the data.
 * @param {React.ReactNode} children - The content to be displayed when data is successfully fetched.
 * @param {string} label - The label to be displayed in the ContainerBody component.
 * @param {string} launchPath - Displays the Launch Button and routes on path
 * @param {SxProps<Theme>} sx - container sx
 *
 * @returns {JSX.Element} The appropriate UI element based on the state of data fetching.
 */
const PmxGridItemTemplate = ({
  isError,
  isFetching,
  isUninitialized,
  refetch,
  children,
  label,
  minHeight,
  launchPath,
  sx,
}: PmxGridItemTemplateProps) => {
  // Show a loading skeleton if data is uninitialized or fetching
  if (isUninitialized || isFetching) {
    return (
      <Skeleton
        data-testid={generateTestId(label, 'skeleton-loading')}
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ minHeight: minHeight ?? '100px' }}
      />
    );
  }

  // Show an error message with options to refresh or contact support if there was an error
  if (isError) {
    return (
      <ContainerBody label="Failed to Load Data" sx={sx}>
        <PmxErrorDisplay onRefresh={refetch} />
      </ContainerBody>
    );
  }

  // Show the children content if data is successfully fetched
  return (
    <ContainerBody label={label} launchPath={launchPath} sx={sx}>
      {children}
    </ContainerBody>
  );
};

export default PmxGridItemTemplate;
