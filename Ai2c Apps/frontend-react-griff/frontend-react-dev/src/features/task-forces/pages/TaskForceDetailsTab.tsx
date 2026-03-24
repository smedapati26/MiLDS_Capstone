import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, ButtonGroup, Stack } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, PmxCollapsibleTreeTable } from '@components/data-tables';
import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';
import { getModels } from '@features/task-forces/components/create-stepper/step 6/utils/getModels';
import {
  EXPANDABLE_SUBORDINATE_COLUMNS as columns,
  IExtSubordinate,
} from '@features/task-forces/components/create-stepper/tableColumns';
import { TaskforceEditEquipmentTab } from '@features/task-forces/components/edit-pages/equipment/TaskforceEditEquipmentTab';
import { TaskforceEditUnitsTab } from '@features/task-forces/components/edit-pages/unit/TaskforceEditUnitsTab';
import { TaskforceLogoHeading } from '@features/task-forces/components/TaskforceLogoHeading';
import { getAllSubordinates } from '@features/task-forces/utils/getAllSubordinates';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { useGetTaskforceDetailsQuery } from '@store/griffin_api/taskforce/slices';

const TaskForceDetailsTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const archived = location.pathname.includes('/archived');

  const { uic } = useParams();
  const { data: taskforce } = useGetTaskforceDetailsQuery(uic);

  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState<'UNIT' | 'EQUIPMENT' | undefined>(undefined);

  useEffect(() => {
    if (!uic) {
      navigate('..', { relative: 'path' });
    }
  }, [navigate, uic]);

  const handleNavigateBack = () => {
    navigate('..', { relative: 'path' });
  };

  const tableData: IExtSubordinate[] = useMemo(() => {
    const subordinates =
      taskforce?.subordinates && taskforce?.subordinates.length > 0
        ? getAllSubordinates(taskforce.subordinates, taskforce.unit.uic, 0)
        : [];
    const subordinateData: SubordinateSchemaType[] = subordinates.map((row) => {
      return {
        id: row.unit.uic,
        uuid: row.unit.uic,
        parentId: row.unit.parentUic,
        level: row.unit.level,
        echelon: row.unit.echelon,
        name: row.unit.displayName,
        ownerId: row.owner?.userId || '',
        shortname: row.unit.shortName,
        nickname: row.unit.nickName,
        aircraft: row.aircraft,
        uas: row.uas,
        agse: row.agse,
      };
    });

    return subordinateData.map((row) => {
      return {
        ...row,
        collapsibleDrawerContent: <></>, //TODO: Figure out what this is supposed to be
        modelCount: getModels(row).length, //TODO: IMPLEMENT MODEL COUNT; Must update backend data to send model along with serial num (and other data that may be needed for edit "current state" display)
      };
    });
  }, [taskforce]);

  const searchOptions = useTableSearchOptions<IExtSubordinate>(columns, tableData, {
    excludeColumns: ['modelCount', 'collapsibleDrawerContent'],
  });

  const filteredTableData: IExtSubordinate[] = useMemo(() => {
    if (!tableData) return [];
    if (!searchQuery) return tableData;

    return tableData.filter((row) => {
      // Check if search query matches any column value (case-insensitive)
      return columns.some((column: ColumnConfig<IExtSubordinate>) => {
        const cellValue = row[column.key as keyof IExtSubordinate];
        return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [searchQuery, tableData]);

  const renderEditModes = () => {
    if (editMode === 'UNIT' && taskforce && !archived) {
      return <TaskforceEditUnitsTab taskforce={taskforce} closeEditMode={() => setEditMode(undefined)} />;
    }

    if (editMode === 'EQUIPMENT' && taskforce && !archived) {
      return <TaskforceEditEquipmentTab taskforce={taskforce} closeEditMode={() => setEditMode(undefined)} />;
    }

    return <></>;
  };

  return (
    <Box>
      {taskforce && !editMode ? (
        <>
          <Button variant="text" onClick={handleNavigateBack} data-testid={'navigation-back-btn'}>
            <ArrowBackIcon fontSize="small" sx={{ mr: 2 }} />
            Back to {archived ? 'Archived' : 'My'} Task Forces
          </Button>
          <Stack direction="column" spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} justifyContent={'space-between'} alignItems={'end'}>
              <Stack direction="column" spacing={2} sx={{ height: '100%' }}>
                <TaskforceLogoHeading
                  owner={taskforce.owner?.rankAndName}
                  logoUrl={taskforce.unit.logo ?? null}
                  name={taskforce.unit.displayName}
                  slogan={taskforce.unit.slogan ?? ''}
                  shortName={taskforce.unit.shortName}
                  echelon={taskforce.unit.echelon}
                  location={taskforce.location}
                  startDate={taskforce.startDate}
                  endDate={taskforce.endDate}
                />
                {!archived && (
                  <ButtonGroup variant="contained">
                    <Button
                      onClick={() => {
                        setEditMode('UNIT');
                      }}
                    >
                      Edit Units
                    </Button>
                    <Button
                      onClick={() => {
                        setEditMode('EQUIPMENT');
                      }}
                    >
                      Edit Equipment
                    </Button>
                  </ButtonGroup>
                )}
              </Stack>
              <SearchBar
                options={searchOptions}
                onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
                styles={{ minWidth: '200px', width: '25%', height: '100%' }}
              />
            </Stack>
            <PmxCollapsibleTreeTable
              rows={filteredTableData}
              columns={columns}
              collapsibleKey="collapsibleDrawerContent"
            />
          </Stack>
        </>
      ) : (
        renderEditModes()
      )}
    </Box>
  );
};

export default TaskForceDetailsTab;
