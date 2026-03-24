import React, { useMemo, useRef, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import LaunchIcon from '@mui/icons-material/Launch';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Paper } from '@mui/material';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { Popper } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { Column, PmxTable } from '@components/PmxTable';
import { IMOSMLReportData, IUnitMOSMLReport } from '@store/amap_ai/unit_health';

export interface IMOSMLReportProps {
  reportData: IUnitMOSMLReport | undefined;
  reportColumns: Column<IMOSMLReportData>[];
  filterValue: string;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
}

export const MOSMLReport: React.FC<IMOSMLReportProps> = ({
  reportData,
  reportColumns,
  filterValue,
  setFilterValue,
}) => {
  const theme = useTheme();
  const [expandedSubordianteAccordions, setExpandedSubordinateAccordions] = useState<string[]>([]);
  const [mosMLPopperAnchor, setMosMLPopperAnchor] = useState<null | HTMLElement>(null);
  const mosmlPopperRef = useRef(null);
  const [mosMLFilter, setmosMLFilter] = useState<string[]>([]);
  const [appliedMosMLFilter, setAppliedMosMLFilter] = useState<string[]>([]);

  const mosOptions = useMemo(() => {
    if (reportData) {
      return Array.from(
        new Set([
          ...(reportData.primaryUnit.reportData?.map((mos) => mos.mos) ?? []),
          ...reportData.subordinateUnits.flatMap(
            (subordinateUnit) => subordinateUnit.reportData?.map((mos) => mos.mos) ?? [],
          ),
        ]),
      );
    }
    return [];
  }, [reportData]);

  const filteredData: IUnitMOSMLReport | undefined = useMemo(() => {
    if (reportData) {
      const filterValueLower = filterValue.toLowerCase();

      let subordinateUnits = reportData.subordinateUnits.filter((subUnit) => {
        const matchesUic = subUnit.unitUic.toLowerCase().includes(filterValueLower);

        const matchesName = subUnit.unitName.toLowerCase().includes(filterValueLower);

        return matchesUic || matchesName;
      });

      if (appliedMosMLFilter.length > 0) {
        subordinateUnits = subordinateUnits.map((subordinateUnit) => ({
          ...subordinateUnit,
          reportData: subordinateUnit.reportData?.filter((report) => appliedMosMLFilter.includes(report.mos)) ?? [],
        }));
      }

      return { primaryUnit: reportData.primaryUnit, subordinateUnits };
    }

    return undefined;
  }, [filterValue, reportData, appliedMosMLFilter]);

  const handleClickSubordinateAccordion = (unitUic: string) => {
    if (expandedSubordianteAccordions.includes(unitUic)) {
      setExpandedSubordinateAccordions((prev) => prev.filter((currUic) => currUic !== unitUic));
    } else {
      setExpandedSubordinateAccordions((prev) => [...prev, unitUic]);
    }
  };

  const handleExpandCollapseAll = () => {
    if (expandedSubordianteAccordions.length > 0) {
      setExpandedSubordinateAccordions([]);
    } else {
      setExpandedSubordinateAccordions(
        reportData?.subordinateUnits.flatMap((subordinateUnit) => subordinateUnit.unitUic) || [],
      );
    }
  };

  const applyFilters = () => {
    setAppliedMosMLFilter(mosMLFilter);
  };

  const cannotFilter = mosMLFilter.length == 0;

  return (
    <Box>
      {filteredData && (
        <Paper sx={{ px: 4, pb: 4, mb: 2 }} aria-label="Primary Unit Report Table">
          <PmxTable
            tableTitle={filteredData.primaryUnit.unitName}
            headerDialogs={
              <Button
                variant="contained"
                size="small"
                sx={{
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey.l60 : theme.palette.grey.d40,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey.l60 : theme.palette.grey.d40,
                  },
                }}
              >
                {' '}
                <LaunchIcon sx={{ height: '20px', width: '20px', mr: 2 }} /> View Expanded Unit
              </Button>
            }
            columns={reportColumns}
            data={filteredData?.primaryUnit.reportData || []}
            getRowId={(data) => data?.mos}
            enforceHeight={false}
          />
        </Paper>
      )}
      {filteredData && (
        <Paper sx={{ px: 4, pb: 4 }} aria-label="Subordinate Unit Tables">
          <Box display="flex" alignItems={'center'} justifyContent={'space-between'} sx={{ pt: 4, pb: 2 }}>
            <Typography variant="h6">Subordinate Details</Typography>

            {/* <Box display={'flex'} justifyContent={'end'}> */}
            <Box display={'flex'} alignItems={'center'}>
              <Typography
                component="a"
                sx={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={() => handleExpandCollapseAll()}
              >
                Expand/Collapse All
              </Typography>

              <Box sx={{ px: 2 }}>
                <IconButton
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    setMosMLPopperAnchor(mosMLPopperAnchor ? null : event.currentTarget);
                  }}
                >
                  <FilterListIcon />
                </IconButton>
                <Popper
                  open={Boolean(mosMLPopperAnchor)}
                  anchorEl={mosMLPopperAnchor}
                  placement="bottom-start"
                  ref={mosmlPopperRef}
                >
                  <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
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
                            setmosMLFilter([]);
                            setAppliedMosMLFilter([]);
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
                        options={mosOptions}
                        value={mosMLFilter}
                        label="MOS"
                        onChange={(value: string | string[]) => {
                          if (Array.isArray(value)) {
                            setmosMLFilter(value.map((val) => val));
                          }
                        }}
                      />
                    </Box>
                    <Box mt={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setMosMLPopperAnchor(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          applyFilters();
                          setMosMLPopperAnchor(null);
                        }}
                        disabled={cannotFilter}
                        aria-label="apply-filters"
                      >
                        Apply
                      </Button>
                    </Box>
                  </Paper>
                </Popper>
              </Box>

              <PmxSearch value={filterValue} onChange={(event) => setFilterValue(event.target.value)} />
            </Box>
          </Box>
          {filteredData.subordinateUnits.map((subUnit) => (
            <Accordion
              key={subUnit.unitUic}
              expanded={expandedSubordianteAccordions.includes(subUnit.unitUic)}
              onClick={() => handleClickSubordinateAccordion(subUnit.unitUic)}
            >
              <AccordionSummary expandIcon={<ArrowDropDownIcon />} id={`${subUnit.unitUic}-header`}>
                <Typography variant="body2">{subUnit.unitName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PmxTable
                  columns={reportColumns}
                  data={subUnit.reportData || []}
                  getRowId={(data) => data?.mos}
                  enforceHeight={false}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}
    </Box>
  );
};
