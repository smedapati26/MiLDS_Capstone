/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { useAMTPFilterContext } from '@context/AMTPFilterProvider';
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
  TextField,
  Typography,
} from '@mui/material';

import { DualDateRangePicker } from '@ai2c/pmx-mui';

import { PmxDropdown } from '@components/dropdowns';
import { DropdownOption } from '@components/dropdowns/PmxDropdown';
import { UnitSelect } from '@components/UnitSelect';
import {
  useLazyGetAwardTypesQuery,
  useLazyGetEvaluationTypesQuery,
  useLazyGetEventTypesQuery,
  useLazyGetTCSLocationsQuery,
  useLazyGetTrainingTypesQuery,
} from '@store/amap_ai/events/slices';
import {
  useLazyGetFaultStatusCodesQuery,
  useLazyGetSoldierFaultIdsQuery,
  useLazyGetSoldierWUCsQuery,
} from '@store/amap_ai/faults/slices/faultsApi';
import { useLazyGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { useLazyGetAllDocumentTypesQuery } from '@store/amap_ai/supporting_documents';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useLazyGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';

export interface SoldierFlagFilterMenuProps {
  flagTypes: string[];
  flagInformation: string[];
  flagMXAvailability: string[];
}

interface FilterMenuProps {
  recorderFilterData?: string[];
  updatedByFilterData?: string[];
  soldierFlagData?: SoldierFlagFilterMenuProps;
  filterType: 'ctl' | 'maintainer' | 'supporting_documents' | 'counselings' | 'soldier_flags' | 'fault_records';
  setFilterSwitch: Dispatch<SetStateAction<boolean>>;
}

const FilterMenu = ({
  recorderFilterData,
  updatedByFilterData,
  soldierFlagData,
  filterType,
  setFilterSwitch,
}: FilterMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const popperRef = useRef(null);
  const open = Boolean(anchorEl);
  const {
    skillLevel,
    setSkillLevel,
    selectedFilterMOS,
    setSelectedFilterMOS,
    selectedUnit,
    setSelectedUnit,
    isCheckboxChecked,
    setIsCheckboxChecked,
    daysUntilDue,
    setDaysUntilDue,
    eventTypes,
    setEventTypes,
    eventInfo,
    setEventInfo,
    eventInfoOptions,
    setEventInfoOptions,
    documentType,
    setDocumentType,
    recorders,
    setRecorders,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    soldierFlagTypes,
    setSoldierFlagTypes,
    soldierFlagInformation,
    setSoldierFlagInformation,
    soldierFlagMXAvailability,
    setSoldierFlagMXAvailability,
    updaters,
    setUpdaters,
    selectedStatusCodes,
    setSelectedStatusCodes,
    selectedFaultIds,
    setSelectedFaultIds,
    selectedWucs,
    setSelectedWucs,
    closedStartDate,
    closedEndDate,
    setClosedStartDate,
    setClosedEndDate,
    clearFilters,
  } = useAMTPFilterContext();
  const { maintainer } = useAppSelector((x) => x.amtpPacket);

  const [fetchUnits, { data: units }] = useLazyGetUnitsQuery();
  const [fetchMOS, { data: allMOS, isLoading: loadingMos }] = useLazyGetAllMOSQuery();
  const [fetchEventTypes, { data: allEventTypes, isLoading: loadingEvents }] = useLazyGetEventTypesQuery();
  const [fetchDocumentType, { data: allDocumentTypes, isLoading: loadingDocumentTypes }] =
    useLazyGetAllDocumentTypesQuery();
  const [fetchTrainingTypes, { isFetching: fetchingTraining }] = useLazyGetTrainingTypesQuery();
  const [fetchEvaluationTypes, { isFetching: fetchingEvaluation }] = useLazyGetEvaluationTypesQuery();

  const [fetchAwardTypes, { isFetching: fetchingAwards }] = useLazyGetAwardTypesQuery();

  const [fetchTcsLocations, { isFetching: fetchingLocations }] = useLazyGetTCSLocationsQuery();

  const [fetchStatusCodes, { data: statusCodes, isFetching: fetchingStatusCodes }] = useLazyGetFaultStatusCodesQuery();
  const [fetchFaultIds, { data: faultIds, isFetching: fetchingFaultIds }] = useLazyGetSoldierFaultIdsQuery();
  const [fetchSoldierWucs, { data: soldierWucs, isFetching: fetchingSoldierWucs }] = useLazyGetSoldierWUCsQuery();

  const [cannotFilter, setCannnotFilter] = useState<boolean>(true);

  useEffect(() => {
    setCannnotFilter(
      selectedFilterMOS.length === 0 &&
        skillLevel.length === 0 &&
        daysUntilDue === '' &&
        selectedUnit === undefined &&
        eventTypes.length === 0 &&
        eventInfo.length === 0 &&
        documentType.length === 0 &&
        recorders.length === 0 &&
        updaters.length === 0 &&
        soldierFlagTypes.length === 0 &&
        soldierFlagInformation.length === 0 &&
        soldierFlagMXAvailability.length === 0 &&
        selectedStatusCodes.length === 0 &&
        selectedFaultIds.length === 0 &&
        selectedWucs.length === 0 &&
        startDate === '' &&
        endDate === '' &&
        closedStartDate === '' &&
        closedEndDate === '',
    );
  }, [
    selectedFilterMOS,
    skillLevel,
    daysUntilDue,
    selectedUnit,
    eventTypes,
    eventInfo,
    documentType,
    recorders,
    startDate,
    endDate,
    updaters,
    soldierFlagTypes,
    soldierFlagInformation,
    soldierFlagMXAvailability,
    selectedStatusCodes,
    selectedFaultIds,
    selectedWucs,
    closedStartDate,
    closedEndDate,
  ]);

  useEffect(() => {
    const fetchEventOptions = async (
      type: string,
      fetchFn: () => Promise<{ type?: string; location?: string; displayName?: string }[]>,
    ) => {
      const res = await fetchFn();

      const childrenOptions =
        //@ts-expect-error
        res?.data?.map((x) => ({
          label: x.type ?? x.location ?? x.displayName,
          value: x.type ?? x.location ?? x.displayName,
        })) ?? [];

      return { label: type, value: type, children: childrenOptions };
    };

    const eventFetchers: Record<
      string,
      () => Promise<{ data: { type?: string; location?: string; displayName?: string }[] }>
    > = {
      Training: () =>
        fetchTrainingTypes(null)
          .unwrap()
          .then((res) => ({ data: res })),
      Evaluation: () =>
        fetchEvaluationTypes(null)
          .unwrap()
          .then((res) => ({ data: res })),
      Award: () =>
        fetchAwardTypes(null)
          .unwrap()
          .then((res) => ({ data: res })),
      TCS: () =>
        fetchTcsLocations(null)
          .unwrap()
          .then((res) => ({ data: res })),
      'PCS/ETS': () =>
        fetchUnits({})
          .unwrap()
          .then((res) => ({ data: res })),
    };

    const getMissingEventTypes = (eventTypes: string[], eventInfoOptions: DropdownOption[]) => {
      return eventTypes.filter(
        // @ts-expect-error
        // eslint-disable-next-line sonarjs/no-nested-functions
        (type) => eventFetchers[type] && !eventInfoOptions.some((opt) => opt.value === type), // Ensure type exists in mapping
      );
    };

    const fetchEventOptionsList = async (missingTypes: string[]) => {
      // @ts-expect-error
      return Promise.all(missingTypes.map((type) => fetchEventOptions(type, eventFetchers[type])));
    };

    (async () => {
      const missingTypes = getMissingEventTypes(eventTypes, eventInfoOptions);

      if (missingTypes.length === 0) return;

      const newOptions = await fetchEventOptionsList(missingTypes);

      setEventInfoOptions((prev) => [...prev, ...(newOptions as DropdownOption[])]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypes]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleUnitOnChange = (selection: IUnitBrief) => {
    setSelectedUnit(selection);
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

  const handleClosedDateOnChange = (_valid: boolean, newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    if (newStartDate && newStartDate?.format('MM/DD/YYYY') !== startDate) {
      setClosedStartDate(newStartDate!.format('MM/DD/YYYY'));
    }

    if (newEndDate && newEndDate?.format('MM/DD/YYY') !== endDate) {
      setClosedEndDate(newEndDate.format('MM/DD/YYYY'));
    }
  };

  useEffect(() => {
    if (filterType === 'ctl') {
      fetchUnits({});
      fetchMOS();
    }
    if (filterType === 'maintainer') {
      fetchEventTypes(null);
    }
    if (filterType === 'supporting_documents') {
      fetchDocumentType();
    }
    if (filterType === 'fault_records') {
      fetchFaultIds({
        soldier_id: maintainer?.id ?? '1234567890',
      });
      fetchSoldierWucs({
        soldier_id: maintainer?.id ?? '1234567890',
      });
      fetchStatusCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <IconButton aria-label="filter-btn" onClick={handleClick}>
        <FilterListIcon />
      </IconButton>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" ref={popperRef}>
        <Paper sx={{ padding: 2, width: '100%', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography component="span">Filters</Typography>
            <Typography
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
                  setFilterSwitch((prev) => !prev);
                }
              }}
            >
              Clear Filters
            </Typography>
          </Box>
          {filterType === 'ctl' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <UnitSelect
                units={units ?? []}
                onChange={handleUnitOnChange}
                value={selectedUnit}
                readOnly={false}
                width="100%"
                label="Unit"
              />
              <PmxDropdown
                multiple
                renderChips
                options={[
                  { label: 'SL 1', value: 'SL1' },
                  { label: 'SL 2', value: 'SL2' },
                  { label: 'SL 3', value: 'SL3' },
                  { label: 'SL 4', value: 'SL4' },
                ]}
                value={skillLevel?.map((item) => item.value) ?? []}
                label="Skill Level"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSkillLevel(value.map((val) => ({ label: val, value: val })));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={allMOS?.map((x: { mos: string }) => x.mos) ?? []}
                value={selectedFilterMOS?.map((item) => item.value) ?? []}
                label="MOS"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSelectedFilterMOS(value.map((val) => ({ label: val, value: val })));
                  }
                }}
                loading={loadingMos}
              />
              <Box ml={2}>
                <FormControlLabel
                  control={
                    <Checkbox checked={isCheckboxChecked} onChange={(e) => setIsCheckboxChecked(e.target.checked)} />
                  }
                  label="Days Until Due"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '2rem', gap: 1 }}>
                  <TextField
                    sx={{ width: '186px' }}
                    value={daysUntilDue}
                    onChange={(e) => setDaysUntilDue(e.target.value)}
                    disabled={!isCheckboxChecked}
                    label="Less Than"
                  />
                  <Typography>days</Typography>
                </Box>
              </Box>
            </Box>
          )}
          {(filterType === 'supporting_documents' || filterType === 'maintainer') && (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              aria-label="Supporting Documents Filter Menu"
            >
              {filterType === 'maintainer' && (
                <>
                  <PmxDropdown
                    multiple
                    renderChips
                    options={allEventTypes?.map((x) => x.type) ?? []}
                    value={eventTypes}
                    label="Event Type"
                    onChange={(value: string | string[]) => {
                      if (Array.isArray(value)) {
                        setEventTypes(value.map((val) => val));
                      }
                    }}
                    loading={loadingEvents}
                  />
                  <PmxDropdown
                    multiple
                    renderChips
                    options={eventInfoOptions ?? []}
                    value={eventInfo}
                    label="Event Information"
                    onChange={(value: string | string[]) => {
                      if (Array.isArray(value)) {
                        setEventInfo(value);
                      }
                    }}
                    loading={fetchingAwards || fetchingEvaluation || fetchingLocations || fetchingTraining}
                  />
                </>
              )}
              {filterType === 'supporting_documents' && (
                <PmxDropdown
                  multiple
                  renderChips
                  options={allDocumentTypes?.map((x: { id: number; type: string }) => x.type) ?? []}
                  value={documentType?.map((item) => item) ?? []}
                  label="Document Type"
                  onChange={(value: string | string[]) => {
                    if (Array.isArray(value)) {
                      setDocumentType(value.map((val) => val));
                    }
                  }}
                  loading={loadingDocumentTypes}
                />
              )}
              <PmxDropdown
                multiple
                renderChips
                options={allDocumentTypes?.map((x: { id: number; type: string }) => x.type) ?? []}
                value={documentType?.map((item) => item) ?? []}
                label="Document Type"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setDocumentType(value.map((val) => val));
                  }
                }}
                loading={loadingDocumentTypes}
              />
              <PmxDropdown
                multiple
                renderChips
                options={recorderFilterData ?? []}
                value={recorders?.map((item) => item) ?? []}
                label="Recorder"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setRecorders(value.map((val) => val));
                  }
                }}
                loading={loadingDocumentTypes}
              />
              <Divider />
              <DualDateRangePicker
                defaultStartDate={dayjs(startDate)}
                defaultEndDate={dayjs(endDate)}
                onDateRangeChange={handleSupportingDocumentDateOnChange}
              />
            </Box>
          )}
          {filterType === 'counselings' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Counselings Filter Menu">
              <PmxDropdown
                multiple
                renderChips
                options={recorderFilterData ?? []}
                value={recorders?.map((item) => item) ?? []}
                label="Recorder"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setRecorders(value.map((val) => val));
                  }
                }}
              />
              <Divider />
              <DualDateRangePicker
                defaultStartDate={dayjs(startDate)}
                defaultEndDate={dayjs(endDate)}
                onDateRangeChange={handleSupportingDocumentDateOnChange}
              />
            </Box>
          )}
          {filterType === 'soldier_flags' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Soldier Flags Filter Menu">
              <PmxDropdown
                multiple
                renderChips
                options={soldierFlagData?.flagTypes?.map((flagType) => flagType) ?? []}
                value={soldierFlagTypes?.map((flagType) => flagType) ?? []}
                label="Type"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSoldierFlagTypes(value.map((val) => val));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={soldierFlagData?.flagInformation?.map((flagInfo) => flagInfo) ?? []}
                value={soldierFlagInformation?.map((flagInfo) => flagInfo) ?? []}
                label="Information"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSoldierFlagInformation(value.map((val) => val));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={soldierFlagData?.flagMXAvailability?.map((mxAvailability) => mxAvailability) ?? []}
                value={soldierFlagMXAvailability?.map((mxAvailability) => mxAvailability) ?? []}
                label="MX Availability"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSoldierFlagMXAvailability(value.map((val) => val));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={recorderFilterData?.map((recorder) => recorder) ?? []}
                value={recorders?.map((recorder) => recorder) ?? []}
                label="Recorder"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setRecorders(value.map((val) => val));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={updatedByFilterData?.map((updatedBy) => updatedBy) ?? []}
                value={updaters?.map((updatedBy) => updatedBy) ?? []}
                label="Updated By"
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setUpdaters(value.map((val) => val));
                  }
                }}
              />
              <Divider />
              <DualDateRangePicker
                defaultStartDate={dayjs(startDate)}
                defaultEndDate={dayjs(endDate)}
                onDateRangeChange={handleSupportingDocumentDateOnChange}
              />
            </Box>
          )}
          {filterType === 'fault_records' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Fault Records Filter Menu">
              <PmxDropdown
                multiple
                renderChips
                options={statusCodes?.map((x) => ({ label: x.value, value: x.value })) ?? []}
                value={selectedStatusCodes?.map((code) => code.value) ?? []}
                label="Fault"
                loading={fetchingStatusCodes}
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSelectedStatusCodes(value.map((val) => ({ label: val, value: val })));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={faultIds ?? []}
                value={selectedFaultIds?.map((code) => code) ?? []}
                label="13-1"
                loading={fetchingFaultIds}
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSelectedFaultIds(value.map((val) => val));
                  }
                }}
              />
              <PmxDropdown
                multiple
                renderChips
                options={soldierWucs ?? []}
                value={selectedWucs?.map((wuc) => wuc) ?? []}
                label="WUC"
                loading={fetchingSoldierWucs}
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    setSelectedWucs(value.map((val) => val));
                  }
                }}
              />
              <Divider />
              <Typography>Discovered On Date Range</Typography>
              <DualDateRangePicker
                defaultStartDate={dayjs(startDate)}
                defaultEndDate={dayjs(endDate)}
                onDateRangeChange={handleSupportingDocumentDateOnChange}
              />
              <Typography>Closed On Date Range</Typography>
              <DualDateRangePicker
                defaultStartDate={dayjs(closedStartDate)}
                defaultEndDate={dayjs(closedEndDate)}
                onDateRangeChange={handleClosedDateOnChange}
              />
            </Box>
          )}
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
                setFilterSwitch((prev) => !prev);
                setAnchorEl(null);
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
  );
};

export default FilterMenu;
