import React, { useEffect, useRef, useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, IconButton, Paper, Popper, Typography } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { IUnitEvaluationsSoldierData } from '@store/amap_ai/unit_health';

export interface IEvaluationFilters {
  unitEvaluationsData: IUnitEvaluationsSoldierData[] | undefined;
  setFilteredUnitEvaluationsData: React.Dispatch<React.SetStateAction<IUnitEvaluationsSoldierData[]>>;
}

export const EvaluationFilters: React.FC<IEvaluationFilters> = ({
  unitEvaluationsData,
  setFilteredUnitEvaluationsData,
}: IEvaluationFilters) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [dropdownFilters, setDropdownFilters] = useState({
    evaluation: [],
    unit: [],
    mos: [],
    ml: [],
  });
  const [appliedFilters, setAppliedFilters] = useState(dropdownFilters);
  const [cannotFilter, setCannotFilter] = useState<boolean>(true);
  const popperRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const popperOpen = Boolean(anchorEl);

  const evaluationOptions = Array.from(new Set(unitEvaluationsData?.flatMap((data) => data.evaluationStatus))) ?? [];
  const unitOptions = Array.from(new Set(unitEvaluationsData?.flatMap((data) => data.unit))) ?? [];
  const mosOptions = Array.from(new Set(unitEvaluationsData?.flatMap((data) => data.mos))) ?? [];
  const mlOptions = Array.from(new Set(unitEvaluationsData?.flatMap((data) => data.ml))) ?? [];

  const clearFilters = () => {
    setDropdownFilters({
      evaluation: [],
      unit: [],
      mos: [],
      ml: [],
    });
    setAppliedFilters({
      evaluation: [],
      unit: [],
      mos: [],
      ml: [],
    });
  };

  const applyFilters = () => {
    setAppliedFilters(dropdownFilters);
  };

  useEffect(() => {
    if (unitEvaluationsData) {
      let filteredData: IUnitEvaluationsSoldierData[] = unitEvaluationsData;

      if (searchFilter.length > 0) {
        const lowerSearchFilter = searchFilter.trim().toLowerCase();

        filteredData = filteredData.filter(
          (soldier) =>
            soldier.name.toLowerCase().includes(lowerSearchFilter) ||
            soldier.userId.toLowerCase().includes(lowerSearchFilter) ||
            soldier.evaluationStatus.toLowerCase().includes(lowerSearchFilter) ||
            soldier.unit.toLowerCase().includes(lowerSearchFilter) ||
            soldier.mos.toLowerCase().includes(lowerSearchFilter) ||
            soldier.ml.toLowerCase().includes(lowerSearchFilter),
        );
      }

      if (!cannotFilter) {
        filteredData = filteredData.filter((soldier) => {
          const filterEvaluation =
            appliedFilters.evaluation.length === 0 ||
            appliedFilters.evaluation.some((evaluation) => evaluation === soldier.evaluationStatus);
          const filterUnit =
            appliedFilters.unit.length === 0 || appliedFilters.unit.some((unit) => unit === soldier.unit);
          const filterMOS = appliedFilters.mos.length === 0 || appliedFilters.mos.some((mos) => mos === soldier.mos);
          const filterML = appliedFilters.ml.length === 0 || appliedFilters.ml.some((ml) => ml === soldier.ml);

          return filterEvaluation && filterUnit && filterMOS && filterML;
        });
      }

      setFilteredUnitEvaluationsData(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, appliedFilters]);

  useEffect(() => {
    setCannotFilter(
      dropdownFilters.evaluation.length === 0 &&
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
              options={evaluationOptions}
              value={dropdownFilters.evaluation}
              label="Annual Evaluation"
              onChange={(value: string | string[]) => {
                if (Array.isArray(value)) {
                  // @ts-expect-error - This mapping will not return never
                  setDropdownFilters((prev) => ({ ...prev, evaluation: value.map((val) => val) }));
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
