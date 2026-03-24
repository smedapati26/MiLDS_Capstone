/* eslint-disable sonarjs/no-nested-functions */
import React, { useEffect, useRef, useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, IconButton, Paper, Popper, Typography } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { IUnitAvailabilityData } from '@store/amap_ai/unit_health';

export interface IAvailabilityFilters {
  unitAvailabilityData: IUnitAvailabilityData[] | undefined;
  setFilteredUnitAvailabilityData: React.Dispatch<React.SetStateAction<IUnitAvailabilityData[]>>;
}

export const AvailabilityFilters: React.FC<IAvailabilityFilters> = ({
  unitAvailabilityData,
  setFilteredUnitAvailabilityData,
}: IAvailabilityFilters) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [dropdownFilters, setDropdownFilters] = useState({
    mxAvailability: [],
    unit: [],
    mos: [],
    ml: [],
  });
  const [appliedFilters, setAppliedFilters] = useState(dropdownFilters);
  const [cannotFilter, setCannotFilter] = useState<boolean>(true);
  const popperRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const popperOpen = Boolean(anchorEl);

  const mxAvailabilityOptions =
    Array.from(
      new Set(unitAvailabilityData?.flatMap((data) => data.soldiers.map((soldier) => soldier.availability))),
    ) ?? [];
  const unitOptions = unitAvailabilityData?.flatMap((data) => data.unitName) ?? [];

  const mosOptions =
    Array.from(new Set(unitAvailabilityData?.flatMap((data) => data.soldiers.map((soldier) => soldier.mos)))) ?? [];

  const mlOptions =
    Array.from(new Set(unitAvailabilityData?.flatMap((data) => data.soldiers.map((soldier) => soldier.ml)))) ?? [];

  const clearFilters = () => {
    setDropdownFilters({
      mxAvailability: [],
      unit: [],
      mos: [],
      ml: [],
    });
    setAppliedFilters({
      mxAvailability: [],
      unit: [],
      mos: [],
      ml: [],
    });
  };

  const applyFilters = () => {
    setAppliedFilters(dropdownFilters);
  };

  useEffect(() => {
    if (unitAvailabilityData) {
      let filteredData: IUnitAvailabilityData[] = unitAvailabilityData;

      if (searchFilter.length > 0) {
        const lowerSearchFilter = searchFilter.trim().toLowerCase();

        filteredData = filteredData
          .map((unit) => {
            const unitNameMatch = unit.unitName.toLowerCase().includes(lowerSearchFilter);

            const filteredSoldiers = unit.soldiers.filter(
              (soldier) =>
                soldier.name.toLowerCase().includes(lowerSearchFilter) ||
                soldier.userId.toLowerCase().includes(lowerSearchFilter) ||
                soldier.email.toLowerCase().includes(lowerSearchFilter) ||
                soldier.availability.toLowerCase().includes(lowerSearchFilter) ||
                soldier.unit.toLowerCase().includes(lowerSearchFilter) ||
                soldier.mos.toLowerCase().includes(lowerSearchFilter) ||
                soldier.ml.toLowerCase().includes(lowerSearchFilter),
            );

            if (unitNameMatch || filteredSoldiers.length > 0) {
              return {
                ...unit,
                soldiers: unitNameMatch ? unit.soldiers : filteredSoldiers,
              };
            }

            return null;
          })
          .filter((unit): unit is IUnitAvailabilityData => unit !== null);
      }

      if (!cannotFilter) {
        filteredData = filteredData
          .map((unit) => {
            const filteredSoldiers = unit.soldiers.filter((soldier) => {
              const filterAvailability =
                appliedFilters.mxAvailability.length === 0 ||
                appliedFilters.mxAvailability.some((mx) => mx === soldier.availability);
              const filterUnit =
                appliedFilters.unit.length === 0 || appliedFilters.unit.some((unit) => unit === soldier.unit);
              const filterMOS =
                appliedFilters.mos.length === 0 || appliedFilters.mos.some((mos) => mos === soldier.mos);
              const filterML = appliedFilters.ml.length === 0 || appliedFilters.ml.some((ml) => ml === soldier.ml);

              return filterAvailability && filterUnit && filterMOS && filterML;
            });

            if (filteredSoldiers.length > 0) {
              return {
                ...unit,
                soldiers: filteredSoldiers,
              };
            }

            return null;
          })
          .filter((unit): unit is IUnitAvailabilityData => unit !== null);
      }

      setFilteredUnitAvailabilityData(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, appliedFilters]);

  useEffect(() => {
    setCannotFilter(
      dropdownFilters.mxAvailability.length === 0 &&
        dropdownFilters.unit.length === 0 &&
        dropdownFilters.mos.length === 0 &&
        dropdownFilters.ml.length === 0,
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
            <PmxDropdown
              multiple
              renderChips
              options={mxAvailabilityOptions}
              value={dropdownFilters.mxAvailability}
              label="MX Availability"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  // @ts-expect-error - This mapping will not return never
                  setDropdownFilters((prev) => ({ ...prev, mxAvailability: value.map((val) => val) }));
                }
              }}
            />
            <PmxDropdown
              multiple
              renderChips
              options={unitOptions}
              value={dropdownFilters.unit}
              label="Unit"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  // @ts-expect-error - This mapping will not return never
                  setDropdownFilters((prev) => ({ ...prev, unit: value.map((val) => val) }));
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
                  // @ts-expect-error - This mapping will not return never
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
                  // @ts-expect-error - This mapping will not return never
                  setDropdownFilters((prev) => ({ ...prev, ml: value.map((val) => val) }));
                }
              }}
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
