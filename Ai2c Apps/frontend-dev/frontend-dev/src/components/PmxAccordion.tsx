import React, { ReactNode } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  CSSProperties,
  FormControlLabel,
  Skeleton,
  styled,
} from '@mui/material';

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
  sx?: CSSProperties;
  isSelectable?: boolean;
  selectedItems?: string[];
  expanded?: boolean;
  handleExpanded?: (val: string) => void;
  handleSelection?: (fileName: string, checked: boolean) => void;
};

/**
 * PmxAccordion component with optional selection checkbox.
 *
 * @component
 * @param {Props} props - The properties object.
 * @param {ReactNode} props.heading - The heading content of the accordion.
 * @param {ReactNode} props.children - The content to be displayed inside the accordion.
 * @param {boolean} [props.isLoading=true] - Flag to indicate if the content is loading.
 * @param {CSSProperties} sx - Custom styling prop.
 * @param {boolean} [props.isSelectable=false] - Whether the accordion includes a checkbox.
 * @param {string[]} [props.selectedItems] - List of selected items.
 * @param {(fileName: string, checked: boolean) => void} [props.handleSelection] - Selection handler.
 *
 * @returns {React.JSX.Element} The rendered accordion component.
 */
const PmxAccordion: React.FC<Props> = (props) => {
  const {
    heading,
    children,
    isLoading = false,
    sx = { margin: 0 },
    isSelectable = false,
    selectedItems = [],
    expanded,
    handleExpanded,
    handleSelection,
  } = props;

  const isChecked = selectedItems.includes(heading as string);

  return isLoading ? (
    <StyledAccordionSkeleton data-testid="skeleton" variant="rectangular" />
  ) : (
    <Accordion
      {...(sx && { sx })}
      expanded={expanded}
      onChange={(_, isExpanded) => {
        if (handleExpanded && typeof heading === 'string') {
          handleExpanded(isExpanded ? heading : '');
        }
      }}
    >
      <AccordionSummary expandIcon={<ArrowDropDownIcon />} aria-controls="panel-content" id="panel-header">
        {isSelectable && handleSelection && (
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Checkbox
                checked={isChecked}
                onChange={(event) => {
                  handleSelection(heading as string, event.target.checked);
                }}
                onClick={(event) => event.stopPropagation()}
              />
            }
            label={heading}
          />
        )}
        {!isSelectable && heading}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default PmxAccordion;
