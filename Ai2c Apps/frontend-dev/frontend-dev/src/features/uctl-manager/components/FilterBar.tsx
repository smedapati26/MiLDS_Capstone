import React, { SetStateAction, useEffect, useRef, useState } from 'react';

import useUnitAccess from '@hooks/useUnitAccess';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ListIcon from '@mui/icons-material/List';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List as MUIList,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

import PmxSearch, { RecentSearch } from '@components/PmxSearch';
import PmxSplitButton from '@components/PmxSplitButton';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { UnitSelect } from '@components/UnitSelect';
import { TaskWithUCTLOut, UCTLSearchResult } from '@features/task-explorer';
import { useLazyGetTasksByTypeQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { IUnitBrief } from '@store/amap_ai/units/models';

interface FilterBarProps {
  listView: string;
  setListView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSearch: { uic: string; title: string };
  setSelectedSearch: (val: { uic: string; title: string }) => void;
  recentSearches: RecentSearch[];
  onRecentSearchClick: (text: string) => void;
  onRemoveRecent: (text: string) => void;
  onClearAllRecent: () => void;
  handleCreate: (val: string) => void;
  units: IUnitBrief[];
  selectedUnit?: IUnitBrief;
  setSelectedUnit: (unit?: IUnitBrief) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  listView,
  setListView,
  selectedSearch,
  setSelectedSearch,
  searchQuery,
  setSearchQuery,
  recentSearches,
  onRecentSearchClick,
  onRemoveRecent,
  onClearAllRecent,
  units,
  selectedUnit,
  setSelectedUnit,
  handleCreate,
}) => {
  const { hasRole } = useUnitAccess();
  const [fetchResults, { data, isFetching }] = useLazyGetTasksByTypeQuery();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchType, setSearchType] = useState<'UCTL' | 'TASK'>('UCTL');

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchResults({ query: searchQuery, search_type: searchType });
    }
  }, [searchQuery, searchType, fetchResults]);

  const renderResults = () => {
    if (isFetching) {
      return <CircularProgress size={20} sx={{ height: '18px !important', width: '18px !important', mt: 2 }} />;
    }

    const rawResults = searchType === 'UCTL' ? (data?.uctlResults ?? []) : (data?.taskResults ?? []);

    if (rawResults.length === 0) {
      return (
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.6 }}>
          No results found.
        </Typography>
      );
    }

    const grouped: Record<string, { unitName: string; items: (UCTLSearchResult | TaskWithUCTLOut)[] }> = {};

    rawResults.forEach((item) => {
      const key = item.unitUic;
      if (!grouped[key]) {
        grouped[key] = {
          unitName: item.unitName,
          items: [],
        };
      }
      grouped[key].items.push(item);
    });

    return (
      <MUIList dense>
        {Object.entries(grouped).map(([unitUic, group]) => (
          <Box key={unitUic} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {group.unitName}
            </Typography>
            {group.items.map((item, index) => (
              <ListItemButton
                key={index}
                // eslint-disable-next-line sonarjs/no-nested-functions
                onClick={() => {
                  setSearchQuery('ictlTitle' in item ? item.ictlTitle : item.taskTitle);
                  setSelectedSearch({
                    uic: item.unitUic,
                    title: 'ictlTitle' in item ? item.ictlTitle : item.taskTitle,
                  });
                }}
              >
                <ListItemText
                  primary={'ictlTitle' in item ? item.ictlTitle : item.taskTitle}
                  secondary={
                    'ictlTitle' in item
                      ? // eslint-disable-next-line sonarjs/no-nested-conditional
                        item.skillLevel
                        ? `Skill Level: ${item.skillLevel}`
                        : undefined
                      : item.subjectArea
                  }
                />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </MUIList>
    );
  };

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) {
      return (
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.6 }}>
          No recent searches.
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="subtitle2" mb={3} mt={3} ml={3}>
          Recent Search
        </Typography>
        <MUIList dense disablePadding>
          {recentSearches.slice(0, 10).map((r) => (
            <ListItemButton key={`${r.text}-${r.addedAt}`} onClick={() => onRecentSearchClick?.(r.text)}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HistoryRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={r.text} />
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent?.(r.text);
                }}
                aria-label="Remove recent"
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </MUIList>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <ListItemButton onClick={onClearAllRecent}>
          <ListItemText primary="Clear All Recent Searches" sx={{ color: 'error.main' }} />
        </ListItemButton>
      </>
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Unit Critical Tasks List</Typography>
        <PmxToggleBtnGroup
          buttons={[
            { label: 'org', value: 'org', btnIcon: <AccountTreeIcon fontSize="small" /> },
            { label: 'list', value: 'list', btnIcon: <ListIcon fontSize="small" /> },
          ]}
          selected={listView}
          onChange={(value) => setListView(value as string)}
        />
      </Box>

      {/* Search and Create */}
      <Box display="flex" alignItems="center" gap={2} mb={3} position="relative">
        <PmxSplitButton
          buttonTitle="CREATE"
          options={[{ label: 'Create UCTL' }, { label: 'Create Task' }]}
          handleClick={(val) => handleCreate(val)}
          disabled={!hasRole('manager')}
        />
        <Box sx={{ flexGrow: 1 }}>
          <PmxSearch
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            fullWidth
            inputRef={searchRef}
          />
          {selectedSearch?.title !== searchQuery && searchQuery.length >= 1 && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                mt: 1,
                maxHeight: 300,
                overflowY: 'auto',
                p: 2,
              }}
            >
              <Box mb={2}>
                <Box display="inline-flex" alignItems="center" gap={2}>
                  <Typography>Search By:</Typography>
                  <PmxToggleBtnGroup
                    buttons={[
                      { label: 'UCTL', value: 'UCTL' },
                      { label: 'TASK', value: 'TASK' },
                    ]}
                    selected={searchType}
                    onChange={(value) => setSearchType(value as SetStateAction<'UCTL' | 'TASK'>)}
                  />
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>

              {searchQuery.length > 2 ? renderResults() : renderRecentSearches()}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Unit Selector */}
      <UnitSelect
        units={units ?? []}
        onChange={setSelectedUnit}
        value={selectedUnit}
        readOnly={false}
        width="100%"
        label="Unit"
      />
    </>
  );
};

export default FilterBar;
