import React, { ReactNode } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Stack, styled, Typography } from '@mui/material';
import { CSSProperties } from '@mui/material/styles/createMixins';

import { PmxLaunchButton } from './inputs';

/* A styled component that renders a skeleton placeholder for an accordion.*/
export const StyledAccordionSkeleton = styled(Skeleton)({
  height: '48px',
  width: '100%',
});

/* Props for the PmxAccordion component. */
export type Props = {
  heading: string | ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  launchPath?: string;
  sx?: CSSProperties;
  expanded?: boolean;
  disabled?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  'data-testid'?: string;
};

/**
 * PmxAccordion component renders an accordion with a loading state.
 *
 * @component
 * @param {Props} props - The properties object.
 * @param {ReactNode} props.heading - The heading content of the accordion.
 * @param {ReactNode} props.children - The content to be displayed inside the accordion.
 * @param {boolean} [props.isLoading=true] - Flag to indicate if the content is loading.
 * @param {string} 'data-testid' - prop to give the select a test id
 * @param {CSSProperties} sx - Custom styling prop for table
 *
 * @returns {JSX.Element} The rendered accordion component.
 */
const PmxAccordion: React.FC<Props> = (props) => {
  const {
    heading,
    children,
    isLoading = true,
    launchPath,
    sx = { margin: 0 },
    expanded,
    onChange,
    disabled = false,
    'data-testid': dataTestId,
  } = props;

  return isLoading ? (
    <Box {...(sx && { sx })}>
      <StyledAccordionSkeleton data-testid="skeleton" variant="rectangular" {...(sx && { sx })} />
    </Box>
  ) : (
    <Accordion expanded={expanded} onChange={onChange} {...(sx && { sx })} disabled={disabled} data-testid={dataTestId}>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="panel2-content"
        id="panel2-header"
        sx={{
          px: 4,
          py: 5,
          '& .MuiAccordionSummary-content': { margin: '0 !important', '&.Mui-expanded': { margin: '0 !important' } },
        }}
      >
        {!launchPath ? (
          typeof heading === 'string' ? (
            <Typography variant="body2">{heading}</Typography>
          ) : (
            heading
          )
        ) : (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', '& .MuiIconButton-root': { top: '-2px' } }}>
            <Typography variant="body2">{heading as string}</Typography>
            <PmxLaunchButton path={launchPath} />
          </Stack>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 4, pb: 5 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default PmxAccordion;
