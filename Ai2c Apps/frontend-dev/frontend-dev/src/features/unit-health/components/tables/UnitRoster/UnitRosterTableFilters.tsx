import React, { useEffect, useRef, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, IconButton, Paper, Popper, styled, ToggleButton, Typography, useTheme } from '@mui/material';

import { DualDateRangePicker } from '@ai2c/pmx-mui';

import { PmxDropdown } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { IUnitRoster } from '@store/amap_ai/unit_health';

export interface IRosterTableFiltersProps {
  unitRosterData: IUnitRoster[] | undefined;
  setFilteredUnitRosterData: React.Dispatch<React.SetStateAction<IUnitRoster[]>>;
}

export interface IRosterTableFilters {
  mxAvailability: string[];
  evaluation: string[];
  rank: string[];
  mos: string[];
  ml: string[];
  birthMonth: string[];
}

export const RosterTableFilters: React.FC<IRosterTableFiltersProps> = ({
  unitRosterData,
  setFilteredUnitRosterData,
}: IRosterTableFiltersProps) => {
  const theme = useTheme();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [dropdownFilters, setDropdownFilters] = useState<IRosterTableFilters>({
    mxAvailability: [],
    evaluation: [],
    rank: [],
    mos: [],
    ml: [],
    birthMonth: [],
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState(dropdownFilters);
  const [cannotFilter, setCannotFilter] = useState<boolean>(true);
  const popperRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const popperOpen = Boolean(anchorEl);

  const rankOptions = Array.from(new Set(unitRosterData?.map((soldier) => soldier.rank))) ?? [];

  const mosOptions = Array.from(new Set(unitRosterData?.map((soldier) => soldier.mos))) ?? [];

  const mlOptions = Array.from(new Set(unitRosterData?.map((soldier) => soldier.ml))) ?? [];

  const birthMonthOptions = Array.from(new Set(unitRosterData?.map((soldier) => soldier.birthMonth))) ?? [];

  const clearFilters = () => {
    setDropdownFilters({
      mxAvailability: [],
      evaluation: [],
      rank: [],
      mos: [],
      ml: [],
      birthMonth: [],
    });
    setAppliedFilters({
      mxAvailability: [],
      evaluation: [],
      rank: [],
      mos: [],
      ml: [],
      birthMonth: [],
    });
    setStartDate('');
    setEndDate('');
  };

  const applyFilters = () => {
    setAppliedFilters(dropdownFilters);
  };

  useEffect(() => {
    if (unitRosterData) {
      let filteredData: IUnitRoster[] = unitRosterData;

      if (searchFilter.length > 0) {
        const lowerSearchFilter = searchFilter.trim().toLowerCase();

        filteredData = filteredData.filter(
          (soldier) =>
            soldier.availability.toLowerCase().includes(lowerSearchFilter) ||
            soldier.name.toLowerCase().includes(lowerSearchFilter) ||
            soldier.userId.toLowerCase().includes(lowerSearchFilter) ||
            soldier.mos.toLowerCase().includes(lowerSearchFilter) ||
            soldier.ml.toLowerCase().includes(lowerSearchFilter) ||
            soldier.birthMonth.toLowerCase().includes(lowerSearchFilter) ||
            soldier.lastEvaluationDate.toLowerCase().includes(lowerSearchFilter) ||
            soldier.evaluationStatus.toLowerCase().includes(lowerSearchFilter),
        );
      }

      if (!cannotFilter) {
        filteredData = filteredData.filter((soldier) => {
          const filterAvailability =
            appliedFilters.mxAvailability.length === 0 ||
            appliedFilters.mxAvailability.some((mx) => mx.toLowerCase() === soldier.availability.toLowerCase());
          const filterEvaluation =
            appliedFilters.evaluation.length === 0 ||
            appliedFilters.evaluation.some((evaluation) =>
              soldier.evaluationStatus.toLowerCase().startsWith(evaluation.toLowerCase()),
            );
          const filterRank =
            appliedFilters.rank.length === 0 || appliedFilters.rank.some((rank) => rank === soldier.rank);
          const filterMOS = appliedFilters.mos.length === 0 || appliedFilters.mos.some((mos) => mos === soldier.mos);
          const filterML = appliedFilters.ml.length === 0 || appliedFilters.ml.some((ml) => ml === soldier.ml);
          const filterBirthMonth =
            appliedFilters.birthMonth.length === 0 ||
            appliedFilters.birthMonth.some((birthMonth) => birthMonth === soldier.birthMonth);
          const filterDates =
            (startDate.length === 0 && endDate.length === 0) ||
            (new Date(startDate) <= new Date(soldier.lastEvaluationDate) &&
              new Date(soldier.lastEvaluationDate) <= new Date(endDate));

          return (
            filterAvailability &&
            filterEvaluation &&
            filterRank &&
            filterMOS &&
            filterML &&
            filterBirthMonth &&
            filterDates
          );
        });
      }

      setFilteredUnitRosterData(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitRosterData, searchFilter, appliedFilters]);

  useEffect(() => {
    setCannotFilter(
      dropdownFilters.mxAvailability.length === 0 &&
        dropdownFilters.evaluation.length === 0 &&
        dropdownFilters.rank.length === 0 &&
        dropdownFilters.mos.length === 0 &&
        dropdownFilters.ml.length === 0 &&
        dropdownFilters.birthMonth.length === 0 &&
        startDate.length === 0 &&
        endDate.length === 0,
    );
  }, [dropdownFilters, startDate, endDate]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleSupportingDocumentDateOnChange = (
    _valid: boolean,
    newStartDate: Dayjs | null,
    newEndDate: Dayjs | null,
  ) => {
    if (newStartDate && newStartDate?.format('MM/DD/YYYY') !== startDate) {
      setStartDate(newStartDate!.format('MM/DD/YYYY'));
    }

    if (newEndDate && newEndDate?.format('MM/DD/YYY') !== endDate) {
      setEndDate(newEndDate.format('MM/DD/YYYY'));
    }
  };

  const ThemedToggleButton = styled(ToggleButton)({
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey.main,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : '#99C7F5',
      borderColor: theme.palette.primary.main,
    },
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton onClick={handleClick} aria-label="Filters Button">
        <FilterListIcon />
      </IconButton>
      <Popper
        open={popperOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        ref={popperRef}
        sx={{ zIndex: 1300 }}
        aria-label="Table Dropdown Filters"
      >
        <Paper sx={{ padding: 2, width: '100%', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography component="span">Filters</Typography>
            <Typography
              aria-label="Clear Filters"
              component="a"
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                ...(cannotFilter && {
                  color: '#66abf0',
                }),
              }}
              onClick={async () => {
                if (!cannotFilter) {
                  clearFilters();
                }
              }}
            >
              Clear Filters
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="body1" sx={{ pr: 2 }}>
              Availability:
            </Typography>
            <Box display="flex" alignContent={'center'} alignItems={'center'}>
              <ThemedToggleButton
                aria-label="Available MX Filter"
                value="available"
                selected={dropdownFilters.mxAvailability.includes('available')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    mxAvailability: prev.mxAvailability.includes('available')
                      ? prev.mxAvailability.filter((mx) => mx !== 'available')
                      : [...prev.mxAvailability, 'available'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.mxAvailability.includes('available') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="available-checked" />
                )}
                Available
              </ThemedToggleButton>

              <ThemedToggleButton
                aria-label="Limited MX Filter"
                value="limited"
                selected={dropdownFilters.mxAvailability.includes('limited')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    mxAvailability: prev.mxAvailability.includes('limited')
                      ? prev.mxAvailability.filter((mx) => mx !== 'limited')
                      : [...prev.mxAvailability, 'limited'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.mxAvailability.includes('limited') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="limited-checked" />
                )}
                Available - Ltd
              </ThemedToggleButton>

              <ThemedToggleButton
                aria-label="Unavailable MX Filter"
                value="unavailable"
                selected={dropdownFilters.mxAvailability.includes('unavailable')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    mxAvailability: prev.mxAvailability.includes('unavailable')
                      ? prev.mxAvailability.filter((mx) => mx !== 'unavailable')
                      : [...prev.mxAvailability, 'unavailable'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.mxAvailability.includes('unavailable') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="unit-checked" />
                )}
                Unavailable
              </ThemedToggleButton>
            </Box>

            <Typography variant="body1" sx={{ pr: 2 }}>
              Evaluation Status:
            </Typography>
            <Box display="flex" alignContent={'center'} alignItems={'center'}>
              <ThemedToggleButton
                aria-label="Met Evaluation Filter"
                value="met"
                selected={dropdownFilters.evaluation.includes('met')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    evaluation: prev.evaluation.includes('met')
                      ? prev.evaluation.filter((mx) => mx !== 'met')
                      : [...prev.evaluation, 'met'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.evaluation.includes('met') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="met-checked" />
                )}
                Met
              </ThemedToggleButton>

              <ThemedToggleButton
                aria-label="Due Evaluation Filter"
                value="due"
                selected={dropdownFilters.evaluation.includes('due')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    evaluation: prev.evaluation.includes('due')
                      ? prev.evaluation.filter((mx) => mx !== 'due')
                      : [...prev.evaluation, 'due'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.evaluation.includes('due') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="due-checked" />
                )}
                Due
              </ThemedToggleButton>

              <ThemedToggleButton
                aria-label="Overdue Evaluation Filter"
                value="overdue"
                selected={dropdownFilters.evaluation.includes('overdue')}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    evaluation: prev.evaluation.includes('overdue')
                      ? prev.evaluation.filter((mx) => mx !== 'overdue')
                      : [...prev.evaluation, 'overdue'],
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.evaluation.includes('overdue') && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="overdue-checked" />
                )}
                Overdue
              </ThemedToggleButton>
            </Box>

            <PmxDropdown
              multiple
              renderChips
              options={rankOptions}
              value={dropdownFilters.rank}
              label="Rank"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  setDropdownFilters((prev) => ({ ...prev, rank: value.map((val) => val) }));
                }
              }}
            />
            <PmxDropdown
              multiple
              renderChips
              options={mosOptions}
              value={dropdownFilters.mos}
              label="MOS"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  setDropdownFilters((prev) => ({ ...prev, mos: value.map((val) => val) }));
                }
              }}
            />
            <PmxDropdown
              multiple
              renderChips
              options={mlOptions}
              value={dropdownFilters.ml}
              label="ML"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  setDropdownFilters((prev) => ({ ...prev, ml: value.map((val) => val) }));
                }
              }}
            />
            <PmxDropdown
              multiple
              renderChips
              options={birthMonthOptions}
              value={dropdownFilters.birthMonth}
              label="Birth Month"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  setDropdownFilters((prev) => ({ ...prev, birthMonth: value.map((val) => val) }));
                }
              }}
            />
            <DualDateRangePicker
              defaultStartDate={dayjs(startDate)}
              defaultEndDate={dayjs(endDate)}
              onDateRangeChange={handleSupportingDocumentDateOnChange}
            />
            <Box mt={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setAnchorEl(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  applyFilters();
                  setAnchorEl(null);
                }}
                disabled={cannotFilter}
                aria-label="apply-filters"
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Paper>
      </Popper>
      <PmxSearch value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
    </Box>
  );
};
