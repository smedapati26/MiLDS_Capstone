/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RHFFilterFormProvider is a React component that provides a filter wrapper for tables.
 * It renders an icon button that opens a popover containing filter options, allowing users
 * to apply or clear filters. The component accepts children to render custom filter UI inside
 * the popover and provides callbacks for filter application.
 */
import React, { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, IconButton, Link, Popover, Stack, SxProps, Theme, Typography, useTheme } from '@mui/material';

/**
 * Props for the RHFFilterFormProvider component.
 */
export type RHFFilterFormProviderProps = {
  /** The title displayed in the popover header. */
  title: string;
  /** Zod Schema for validation */
  schema: any;
  /** Default values for form */
  defaultValues: { [x: string]: any };
  /** Optional children to render inside the popover body, typically filter UI components. */
  children?: ReactNode;
  /** Optional callback function invoked when the clear filters button is clicked. */
  onClearFilters?: () => void;
  /** Optional callback function invoked when the Apply button is clicked. */
  onSubmitFilters?: (values: any) => void;
  /** Adds filter text next to Icon */
  filterText?: string;
  /** Replaces default filter Icon */
  filterIcon?: ReactNode;
  /** Replaces submit button text */
  submitText?: string;
  /** SX styles */
  sx?: SxProps<Theme>;
  /** Disabled option for button */
  disabled?: boolean;
};

/**
 * RHFFilterFormProvider component.
 * Manages the state of a filter popover, including opening, closing, and applying filters.
 */
export const RHFFilterFormProvider: React.FC<RHFFilterFormProviderProps> = ({
  title,
  children,
  schema,
  defaultValues,
  onClearFilters,
  onSubmitFilters,
  filterText,
  filterIcon,
  submitText,
  sx,
  disabled = false,
}) => {
  // State to manage the anchor element for the popover
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  // Boolean to determine if the popover is open
  const open = Boolean(filterAnchorEl);
  const { palette } = useTheme();

  // Dynamically infer schema type
  type FilterSchemaType = z.infer<typeof schema>;

  // React Hook Form Methods
  const methods = useForm<FilterSchemaType>({
    mode: 'all', // Validation Mode All = On Blur, On Change, On Submit
    resolver: zodResolver(schema), // Zod resolver for validations
    defaultValues: defaultValues, // Default values
  });

  /**
   * Handles opening the popover by setting the anchor element to the clicked button.
   * @param event - The mouse event from the icon button click.
   */
  const handleOnOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  /**
   * Handles closing the popover by clearing the anchor element.
   */
  const handleOnClose = () => setFilterAnchorEl(null);

  /**
   * Handles applying the filters: calls the onApplyFilter callback if provided, then closes the popover.
   */
  const handleOnClearFilters = () => {
    if (onClearFilters) {
      onClearFilters(); // Handle Clearing filters outside of Component
    } else {
      methods.reset();
      handleOnSubmitFilters(); // Apply filters and close
    }
  };

  /**
   * Handles applying the filters: calls the onApplyFilter callback if provided, then closes the popover.
   */
  const handleOnSubmitFilters = () => {
    if (onSubmitFilters) onSubmitFilters(methods.getValues());
    setFilterAnchorEl(null);
  };

  const renderIcon = () => (!filterIcon ? <FilterListIcon /> : filterIcon);
  return (
    <FormProvider {...methods}>
      {/* Icon button to open the filter popover */}

      {!filterText ? (
        <IconButton aria-label={`${title} open button`} onClick={handleOnOpen} sx={{ ...sx }} disabled={disabled}>
          {renderIcon()}
        </IconButton>
      ) : (
        <Button
          aria-label={`${title} open button`}
          startIcon={renderIcon()}
          onClick={handleOnOpen}
          sx={{ ...sx }}
          disabled={disabled}
        >
          {filterText}
        </Button>
      )}

      {/* Popover containing the filter menu */}
      <Popover
        open={open}
        anchorEl={filterAnchorEl}
        onClose={handleOnClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            p: 4,
            width: 400,
            backgroundColor: palette.mode === 'dark' ? palette.layout.background7 : palette.layout.base,
          },
        }}
      >
        {/* Header section with title and clear filters link */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Typography variant="body2" gutterBottom>
            {title}
          </Typography>
          <Link onClick={handleOnClearFilters}>Clear Filters</Link>
        </Box>

        {/* Body section containing the filter children */}
        <form onSubmit={methods.handleSubmit(handleOnSubmitFilters)}>
          <Stack direction="column" gap={4}>
            {/** Filter Form */}
            {children}
          </Stack>

          {/* Footer section with Cancel and Apply buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              marginTop: 6,
            }}
          >
            <Button variant="outlined" color="primary" onClick={handleOnClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {submitText ? submitText : 'Apply'}
            </Button>
          </Box>
        </form>
      </Popover>
    </FormProvider>
  );
};
