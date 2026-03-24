import React, { useEffect, useRef, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Popper,
  styled,
  ToggleButton,
  Typography,
  useTheme,
} from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxDatePicker from '@components/PmxDatePicker';
import PmxSearch from '@components/PmxSearch';
import { IUnitMissingPacketsSoldierData } from '@store/amap_ai/unit_health';

export interface IMissingPacketsFiltersProps {
  unitMissingPacketsData: IUnitMissingPacketsSoldierData[] | undefined;
  setFilteredUnitMissingPacketsData: React.Dispatch<React.SetStateAction<IUnitMissingPacketsSoldierData[]>>;
}

export interface IMissingPacketsDropdownFilterProps {
  packetStatus: 'All' | 'Uploaded' | 'Missing';
  unit: string[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
}

export const MissingPacketsFilters: React.FC<IMissingPacketsFiltersProps> = ({
  unitMissingPacketsData,
  setFilteredUnitMissingPacketsData,
}: IMissingPacketsFiltersProps) => {
  const theme = useTheme();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [dropdownFilters, setDropdownFilters] = useState<IMissingPacketsDropdownFilterProps>({
    packetStatus: 'All',
    unit: [],
    startDate: null,
    endDate: null,
    noEndDate: false,
  });
  const [appliedFilters, setAppliedFilters] = useState(dropdownFilters);
  const [cannotFilter, setCannotFilter] = useState<boolean>(true);
  const popperRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const popperOpen = Boolean(anchorEl);

  const unitOptions = Array.from(new Set(unitMissingPacketsData?.flatMap((data) => data.unit))) ?? [];

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

  const clearFilters = () => {
    setDropdownFilters({
      packetStatus: 'All',
      unit: [],
      startDate: null,
      endDate: null,
      noEndDate: false,
    });
    setAppliedFilters({
      packetStatus: 'All',
      unit: [],
      startDate: null,
      endDate: null,
      noEndDate: false,
    });
  };

  const applyFilters = () => {
    setAppliedFilters(dropdownFilters);
  };

  useEffect(() => {
    if (unitMissingPacketsData) {
      let filteredData: IUnitMissingPacketsSoldierData[] = unitMissingPacketsData;

      if (searchFilter.length > 0) {
        const lowerSearchFilter = searchFilter.trim().toLowerCase();

        filteredData = filteredData.filter(
          (soldier) =>
            soldier.name.toLowerCase().includes(lowerSearchFilter) ||
            soldier.userId.toLowerCase().includes(lowerSearchFilter) ||
            soldier.packetStatus.toLowerCase().includes(lowerSearchFilter) ||
            soldier.unit.toLowerCase().includes(lowerSearchFilter) ||
            soldier.arrivalAtUnit?.includes(lowerSearchFilter),
        );
      }

      if (!cannotFilter) {
        filteredData = filteredData.filter((soldier) => {
          const soldierArrivalDate = dayjs(soldier.arrivalAtUnit);

          const filterEvaluation =
            appliedFilters.packetStatus.length === 0 ||
            appliedFilters.packetStatus === 'All' ||
            appliedFilters.packetStatus === soldier.packetStatus;
          const filterUnit =
            appliedFilters.unit.length === 0 || appliedFilters.unit.some((unit) => unit === soldier.unit);
          const filterDate =
            (!appliedFilters.startDate?.isValid() && !appliedFilters.endDate?.isValid()) ||
            (!appliedFilters.noEndDate &&
              soldierArrivalDate.isValid() &&
              appliedFilters.startDate?.isValid() &&
              soldierArrivalDate.isAfter(appliedFilters.startDate)) ||
            (soldierArrivalDate.isValid() &&
              appliedFilters.startDate?.isValid() &&
              appliedFilters.endDate?.isValid() &&
              soldierArrivalDate.isAfter(appliedFilters.startDate) &&
              soldierArrivalDate.isBefore(appliedFilters.endDate));

          return filterEvaluation && filterUnit && filterDate;
        });
      }

      setFilteredUnitMissingPacketsData(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, appliedFilters]);

  useEffect(() => {
    setCannotFilter(
      dropdownFilters.packetStatus.length === 0 &&
        dropdownFilters.unit.length === 0 &&
        dropdownFilters.startDate === null &&
        dropdownFilters.endDate === null &&
        dropdownFilters.noEndDate === false,
    );
  }, [dropdownFilters]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

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
              Packet Status:
            </Typography>
            <Box display="flex" alignContent={'center'} alignItems={'center'}>
              <ThemedToggleButton
                aria-label="All Packet Status Button"
                value="All"
                selected={dropdownFilters.packetStatus === 'All'}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    packetStatus: 'All',
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.packetStatus === 'All' && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="all-checked" />
                )}
                All
              </ThemedToggleButton>
              <ThemedToggleButton
                aria-label="Uploaded Packet Status Button"
                value="Uploaded"
                selected={dropdownFilters.packetStatus === 'Uploaded'}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    packetStatus: 'Uploaded',
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.packetStatus === 'Uploaded' && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="uploaded-checked" />
                )}
                Uploaded
              </ThemedToggleButton>
              <ThemedToggleButton
                aria-label="Missing Packet Status Button"
                value="Missing"
                selected={dropdownFilters.packetStatus === 'Missing'}
                onChange={() =>
                  setDropdownFilters((prev) => ({
                    ...prev,
                    packetStatus: 'Missing',
                  }))
                }
                sx={{ mr: 2, borderRadius: 2 }}
              >
                {dropdownFilters.packetStatus === 'Missing' && (
                  <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="missing-checked" />
                )}
                Missing
              </ThemedToggleButton>
            </Box>
            <Divider />
            <PmxDropdown
              multiple
              renderChips
              options={unitOptions}
              value={dropdownFilters.unit}
              label="Unit"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  setDropdownFilters((prev) => ({ ...prev, unit: value.map((val) => val) }));
                }
              }}
            />
            <Divider />
            <Box display={'flex'}>
              <PmxDatePicker
                label="Start Date"
                value={dropdownFilters.startDate}
                onChange={(date: Dayjs | null) => setDropdownFilters((prev) => ({ ...prev, startDate: date }))}
                shrinkLabel
              />
              <Typography display="flex" alignItems={'center'} sx={{ px: 4 }}>
                -
              </Typography>
              <PmxDatePicker
                label="End Date"
                value={dropdownFilters.endDate}
                onChange={(date: Dayjs | null) => setDropdownFilters((prev) => ({ ...prev, endDate: date }))}
                shrinkLabel
                disabled={!dropdownFilters.noEndDate}
              />
            </Box>
            <FormControlLabel
              label="No End Date"
              sx={{ pl: 2 }}
              control={
                <Checkbox
                  checked={dropdownFilters.noEndDate}
                  onChange={() => setDropdownFilters((prev) => ({ ...prev, noEndDate: !prev.noEndDate }))}
                />
              }
            ></FormControlLabel>

            <Box sx={{ mr: 2, mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
