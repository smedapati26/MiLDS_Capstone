import React, { useState } from 'react';

import { Error } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

interface PmxAccordionItemTemplateProps {
  title: string;
  total: number | undefined;
  children: React.ReactNode;

  // Derived request status booleans
  isFetching?: boolean;
  isError?: boolean;
  refetch?: () => void;

  // Callback for accordion open event
  onAccordionChange?: (event: { title: string; expanded: boolean }) => void;
}

/**
 * PmxAccordionItemTemplate component renders an accordion item with customizable title, total, children, and error/fetching states.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.title - The title of the accordion item.
 * @param {number} [props.total] - The total number to display in the accordion item.
 * @param {React.ReactNode} props.children - The content to display inside the accordion item.
 * @param {boolean} [props.isError] - Flag indicating if there is an error.
 * @param {boolean} [props.isFetching] - Flag indicating if data is being fetched.
 * @param {Function} [props.refetch] - Function to refetch data in case of an error.
 * @param {Function} [props.onAccordionChange] - Callback function to handle accordion state change.
 *
 * @returns {JSX.Element} The rendered accordion item component.
 */
const PmxAccordionItemTemplate = ({
  title,
  total,
  children,
  isError,
  isFetching,
  refetch,
  onAccordionChange,
}: PmxAccordionItemTemplateProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(false);

  /**
   * Handles the change event when the accordion is expanded or collapsed.
   * Toggles the expanded state and calls the onAccordionChange callback if provided.
   *
   * @param {string} title - The title of the accordion item.
   */
  const handleChange = (title: string) => {
    setExpanded(!expanded);
    onAccordionChange && onAccordionChange({ title, expanded: !expanded });
  };

  /**
   * Renders the appropriate icon based on the error and total states.
   * Displays an error icon if there is an error, the total number if provided, or a loading spinner otherwise.
   *
   * @returns {JSX.Element} The rendered icon component.
   */
  const renderIcon = () => {
    if (isError) {
      return (
        <Error
          data-testid="error-icon"
          color="error"
          sx={{
            fill: `${theme.palette.error.main} !important`,
            width: '20px',
            height: 'auto',
          }}
        />
      );
    }

    if (isFetching || !total) {
      return (
        <CircularProgress data-testid="loading-icon" sx={{ height: '20px !important', width: '20px !important' }} />
      );
    }

    return <Typography variant="body3">{total}</Typography>;
  };

  /**
   * Renders the content inside the accordion details.
   * Displays a loading spinner and message if data is being fetched, an error message and retry button if there is an error, or the children content otherwise.
   *
   * @returns {JSX.Element} The rendered content component.
   */
  const renderData = () => {
    if (isFetching) {
      return (
        <Stack direction="row" justifyItems="center" spacing={2}>
          <CircularProgress data-testid="loading-icon" sx={{ height: '20px !important', width: '20px !important' }} />
          <Typography variant="body1">Loading...</Typography>
        </Stack>
      );
    }

    if (isError) {
      return (
        <>
          <Typography variant="body1">Something went wrong while fetching data.</Typography>
          <Button
            size="small"
            sx={{ textTransform: 'none', textDecoration: 'underline', marginLeft: '-5px', marginTop: '12px' }}
            onClick={() => refetch && refetch()}
          >
            Try again
          </Button>
        </>
      );
    }

    return children;
  };

  return (
    <Accordion
      data-testid="accordion-item"
      expanded={expanded}
      onChange={() => handleChange(title)}
      sx={{ m: 0, '&.Mui-expanded': { m: 0 } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <Typography variant="body2">{title}</Typography>
          <Divider orientation="vertical" flexItem />
          {renderIcon()}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{renderData()}</AccordionDetails>
    </Accordion>
  );
};

export default PmxAccordionItemTemplate;
