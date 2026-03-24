import React, { useEffect } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Collapse, styled, Tab } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import { resetMaintenanceScheduleForm } from '@features/maintenance-schedule/slices';
import {
  resetEditEvent,
  selectIsMaintenanceEditForm,
  setIsMaintenanceEditForm,
} from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import {
  selectActiveFormType,
  selectIsLaneEditFormOpen,
  setIsLaneEditFormOpen,
} from '@features/maintenance-schedule/slices/maintenanceLaneEditSlice';
import { resetPhaseTeam } from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { useAppDispatch, useAppSelector } from '@store/hooks';

import AddEditFormWrapper from './AddEditFormWrapper';
import { VerticalToolbarPanel } from './VerticalToolbarPanel';
import { VerticalToolbarTabs } from './VerticalToolbarTabs';

/**
 * Represents the styled toolbar component for the MaintenanceScheduleLayout.
 *
 * @component
 */
const StyledToolbar = styled(Box)(({ theme }) => {
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: isDarkMode ? theme.palette.layout?.background5 : theme.palette.layout?.base,
    border: `1px solid ${isDarkMode ? theme.palette.layout?.background7 : theme.palette.layout?.background5}`,
    boxShadow: theme.palette.boxShadow,
    borderRadius: '3px',
  };
});

/**
 * Represents a tool in the toolbar.
 */
export type Tool = {
  label: string;
  icon: string | React.ReactElement;
  element: React.ReactNode;
};

/**
 * Renders a horizontal toolbar component.
 */
export const VerticalToolbar = ({ onUpdate }: { onUpdate?: () => void }) => {
  const [formKey, setFormKey] = React.useState(0);
  const [value, setValue] = React.useState<number | boolean>(false);
  const [expanded, setExpanded] = React.useState(false);
  const editExpanded = useAppSelector(selectIsMaintenanceEditForm);
  const dispatch = useAppDispatch();
  const formType = useAppSelector(selectActiveFormType);

  const isLaneEditOpen = useAppSelector(selectIsLaneEditFormOpen);

  const handleClick = (key: number) => {
    dispatch(resetEditEvent());
    dispatch(resetMaintenanceScheduleForm());
    dispatch(resetPhaseTeam());
    setValue(key !== value ? key : false);
    setExpanded(key !== value || !expanded);
  };

  useEffect(() => {
    if (editExpanded) {
      setValue(1);
      setExpanded(true);

      // Give React time to render before resetting
      const resetTimeout = setTimeout(() => {
        dispatch(setIsMaintenanceEditForm(false));
      }, 250);

      return () => clearTimeout(resetTimeout); // clean up if component unmounts
    }
  }, [dispatch, editExpanded]);

  useEffect(() => {
    if (isLaneEditOpen) {
      setValue(1);
      setExpanded(true);

      const resetTimeout = setTimeout(() => {
        dispatch(setIsLaneEditFormOpen(false));
      }, 250);

      return () => clearTimeout(resetTimeout); // clean up if component unmounts
    }
  }, [dispatch, isLaneEditOpen]);

  const borderRadius = expanded ? 0 : '3px';
  const tools: Tool[] = [
    {
      label: 'add',
      icon: <AddCircleIcon />,
      element: (
        <AddEditFormWrapper
          key={formKey}
          type="add"
          defaultFormType="maint"
          onCancel={() => {
            setExpanded(false);
            setValue(false);
            setFormKey((prev) => prev + 1); // force form remount
          }}
          onSubmit={() => {
            setExpanded(false);
            setValue(false);
            setFormKey((prev) => prev + 1); // force form remount
            onUpdate?.();
          }}
        />
      ),
    },
    {
      label: 'edit',
      icon: <EditIcon />,
      element: (
        <AddEditFormWrapper
          key={formKey}
          type="edit"
          defaultFormType={formType ?? 'maint'}
          onCancel={() => {
            setExpanded(false);
            setValue(false);
            setFormKey((prev) => prev + 1);
          }}
          onSubmit={() => {
            setExpanded(false);
            setValue(false);
            setFormKey((prev) => prev + 1);
            onUpdate?.();
          }}
        />
      ),
    },
  ];

  return (
    <Box
      id="ms-toolbar"
      data-testid="ms-toolbar"
      sx={{
        display: 'flex',
        justifyContent: 'row',
        mb: 3,
        position: 'sticky',
        top: '0px',
        alignSelf: 'start',
        height: 'fit-content',
        zIndex: 1000,
      }}
    >
      {/* Drawer */}
      <Collapse in={expanded} orientation="horizontal" timeout="auto" data-testid="COOLLAPSE" key={expanded.toString()}>
        {tools.map((tool, index) => (
          <VerticalToolbarPanel
            key={tool.label}
            value={value}
            index={index}
            sx={{ border: 'none', borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius }}
          >
            {tool.element}
          </VerticalToolbarPanel>
        ))}
      </Collapse>
      {/* Toolbar menu */}
      <StyledToolbar sx={{ border: 'none', borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }}>
        <VerticalToolbarTabs value={value as number} handleChange={() => {}}>
          {tools.map((tool, index) => (
            <Tab
              key={slugify(tool.label)}
              component="div"
              aria-label={tool.label}
              data-testid={`${tool.label}-tab-button`}
              icon={tool.icon}
              onClick={() => handleClick(index)}
            />
          ))}
        </VerticalToolbarTabs>
      </StyledToolbar>
    </Box>
  );
};
