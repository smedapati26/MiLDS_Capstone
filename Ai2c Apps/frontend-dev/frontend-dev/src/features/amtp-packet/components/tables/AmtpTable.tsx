/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

import { AMTPFilterProvider, useAMTPFilterContext } from '@context/AMTPFilterProvider';
import { Box, Typography } from '@mui/material';

import { PmxTable, PmxTableProps } from '@components/PmxTable';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { IDa7817s } from '@store/amap_ai/events';
import { FaultAction } from '@store/amap_ai/faults/models';
import { ICtlsColumns } from '@store/amap_ai/readiness/models';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { convertToSnakeCase } from '@utils/helpers/dataTransformer';

import AmtpTableFilters from './AmtpTableFilters';

interface ICTLData {
  ictlUnit: string;
}
interface SupportDocumentData {
  id: number;
  type: string;
  recordedBy: string;
  documentDate: string;
}
interface CounselingData {
  uploadedBy: string;
  date: string;
}
interface SoldierFlagData {
  startDate: string;
  endDate: string;
  flagType: string;
  flagInfo: string;
  mxAvailability: string;
  createdByName: string;
  lastModifiedName: string;
}

type FaultType = 'Reporter' | 'Maintainer' | 'Inspector' | 'Closer';
type FaultFilter = FaultType[] | undefined;

type FilterData = ICtlsColumns &
  ICTLData &
  SupportDocumentData &
  CounselingData &
  IDa7817s &
  SoldierFlagData &
  FaultAction;

export const AmtpTable = <T extends object, U extends object>(props: {
  tableProps: PmxTableProps<T, U>;
  filterType?: 'ctl' | 'maintainer' | 'supporting_documents' | 'counselings' | 'soldier_flags' | 'fault_records';
}) => {
  return (
    <AMTPFilterProvider>
      <BaseAmtpTable {...props} />
    </AMTPFilterProvider>
  );
};

const BaseAmtpTable = <T extends object, U extends object>({
  tableProps,
  filterType = 'ctl',
}: {
  tableProps: PmxTableProps<T, U>;
  filterType?: 'ctl' | 'maintainer' | 'supporting_documents' | 'counselings' | 'soldier_flags' | 'fault_records';
}) => {
  const selectedUnitRef = useRef<IUnitBrief | undefined>(undefined);
  // Main Filters
  const [query, setQuery] = useState<string>('');
  const [selectedMOS, setSelectedMOS] = useState<{ label: string; value: string }[]>([]);
  const [faultType, setFaultType] = useState<FaultFilter>(undefined);
  const {
    skillLevel,
    selectedFilterMOS,
    selectedUnit,
    daysUntilDue,
    eventTypes,
    eventInfo,
    documentType,
    recorders,
    startDate,
    endDate,
    soldierFlagTypes,
    soldierFlagInformation,
    soldierFlagMXAvailability,
    updaters,
    selectedFaultIds,
    selectedStatusCodes,
    selectedWucs,
    closedStartDate,
    closedEndDate,
  } = useAMTPFilterContext();
  const [filteredData, setFilteredData] = useState<T[]>(tableProps.data);

  const [filterSwitch, setFilterSwitch] = useState<boolean>(false);

  useEffect(() => {
    selectedUnitRef.current = selectedUnit;
  }, [selectedUnit]);

  const applyFilters = () => {
    // Check if all filters are empty
    const noFiltersApplied =
      query === '' &&
      selectedMOS.length === 0 &&
      skillLevel.length === 0 &&
      (!selectedUnitRef.current || selectedUnitRef.current.displayName.trim() === '') &&
      selectedFilterMOS.length === 0 &&
      daysUntilDue === '' &&
      eventTypes.length === 0 &&
      eventInfo.length === 0 &&
      documentType.length === 0 &&
      recorders.length === 0 &&
      startDate.length === 0 &&
      endDate.length === 0 &&
      soldierFlagTypes.length === 0 &&
      soldierFlagInformation.length === 0 &&
      soldierFlagMXAvailability.length === 0 &&
      updaters.length === 0 &&
      faultType?.length === 0 &&
      selectedFaultIds.length === 0 &&
      selectedStatusCodes.length === 0 &&
      selectedWucs.length === 0 &&
      closedStartDate.length === 0 &&
      closedEndDate.length === 0;

    // If no filters are applied, return the original dataset
    if (noFiltersApplied) {
      setFilteredData(tableProps.data);
      return;
    }

    // Otherwise, apply filters
    // eslint-disable-next-line sonarjs/cognitive-complexity
    const result = tableProps.data.filter((item) => {
      const filterItem = item as FilterData;

      // GENERAL FILTERS
      const queryMatch =
        query === '' || Object.values(filterItem).join(' ').toLowerCase().includes(query.toLowerCase());
      const mosMatch = selectedMOS.length === 0 || selectedMOS.some((mos) => mos.value === filterItem.mos);

      // CTL FILTERS
      const skillLevelMatch = skillLevel.length === 0 || skillLevel.some((sl) => sl.value === filterItem.skillLevel);
      const unitMatch =
        !selectedUnitRef.current || // Allow no selection
        selectedUnitRef.current.displayName.trim() === '' || // Ignore empty unit
        selectedUnitRef.current.displayName === filterItem.ictlUnit; // Apply filter only when valid

      const filterMos = selectedFilterMOS.length === 0 || selectedFilterMOS.some((mos) => mos.value === filterItem.mos);
      const daysUntilDueMatch =
        daysUntilDue === '' ||
        (!isNaN(Number(daysUntilDue)) &&
          filterItem.nextDue !== null &&
          Number(filterItem.nextDue) <= Number(daysUntilDue));

      // MAINTAINER FILTERS
      const filterEventTypes = eventTypes.length === 0 || eventTypes.some((event) => event === filterItem.eventType);
      const filterEventInfo =
        eventInfo.length === 0 ||
        eventInfo.some(
          (event) =>
            event === filterItem.awardType ||
            event === filterItem.evaluationType ||
            event === filterItem.trainingType ||
            event === filterItem.tcsLocation ||
            event === filterItem.gainingUnit?.displayName,
        );
      const isValidDate = (date: string) => !isNaN(new Date(date).getTime());

      const eventDates =
        (!isValidDate(startDate) && !isValidDate(endDate)) ||
        (isValidDate(filterItem.date) &&
          isValidDate(startDate) &&
          isValidDate(endDate) &&
          new Date(startDate).toISOString().split('T')[0] <= new Date(filterItem.date).toISOString().split('T')[0] &&
          new Date(filterItem.date).toISOString().split('T')[0] <= new Date(endDate).toISOString().split('T')[0]);

      // SUPPORTING DOCUMENT FILTERS
      const filterDocumentType = documentType.length === 0 || documentType.some((doc) => doc === filterItem.type);
      const supportDocumentRecorder =
        filterType !== 'supporting_documents' ||
        recorders.length === 0 ||
        recorders.some((recorder) => recorder === filterItem.recordedBy);
      const supportDocDates =
        filterType !== 'supporting_documents' ||
        (startDate.length === 0 && endDate.length === 0) ||
        (new Date(startDate) <= new Date(filterItem.documentDate) &&
          new Date(filterItem.documentDate) <= new Date(endDate));

      // COUNSELINGS FILTERS
      const counselingRecorder =
        filterType !== 'counselings' ||
        recorders.length === 0 ||
        recorders.some((uploader) => uploader === filterItem.uploadedBy);
      const counselingDates =
        filterType !== 'counselings' ||
        (startDate.length === 0 && endDate.length === 0) ||
        (new Date(startDate) <= new Date(filterItem.date) && new Date(filterItem.date) <= new Date(endDate));

      // SOLDIER FLAG FILTERS
      const filterSoldierFlagType =
        filterType !== 'soldier_flags' ||
        soldierFlagTypes.length === 0 ||
        soldierFlagTypes.some((soldierFlagType) => soldierFlagType === filterItem.flagType);
      const filterSoldierFlagInformation =
        filterType !== 'soldier_flags' ||
        soldierFlagInformation.length === 0 ||
        soldierFlagInformation.some((currentInformation) => currentInformation === filterItem.flagInfo);
      const filterSoldierFlagMXAvailability =
        filterType !== 'soldier_flags' ||
        soldierFlagMXAvailability.length === 0 ||
        soldierFlagMXAvailability.some((mxAvailability) => mxAvailability === filterItem.mxAvailability);
      const soldierFlagRecorder =
        filterType !== 'soldier_flags' ||
        recorders.length === 0 ||
        recorders.some((recorder) => recorder === filterItem.createdByName);
      const soldierFlagUpdatedBy =
        filterType !== 'soldier_flags' ||
        updaters.length === 0 ||
        updaters.some((updater) => updater === filterItem.lastModifiedName);
      const soldierFlagDates =
        filterType !== 'soldier_flags' ||
        (startDate.length === 0 && endDate.length === 0) ||
        (new Date(startDate) <= new Date(filterItem.startDate) && new Date(filterItem.endDate) <= new Date(endDate));

      // FAULT RECORDS FILTERS
      const filterFaultTypes =
        filterType !== 'fault_records' ||
        !faultType ||
        faultType.length === 0 ||
        faultType.includes(filterItem.role as FaultType);

      const faultRecordDiscoveredDates =
        filterType !== 'fault_records' ||
        (startDate.length === 0 && endDate.length === 0) ||
        (new Date(startDate) <= new Date(filterItem.discoveredOn) &&
          new Date(filterItem.discoveredOn) <= new Date(endDate));

      const faultRecordClosedDates =
        filterType !== 'fault_records' ||
        (closedStartDate.length === 0 && closedEndDate.length === 0) ||
        (new Date(closedStartDate) <= new Date(filterItem.closedOn) &&
          new Date(filterItem.closedOn) <= new Date(closedEndDate));

      const wucMatch = selectedWucs.length === 0 || selectedWucs.some((wuc) => wuc === filterItem.faultWorkUnitCode);
      const faultIdMatch =
        selectedFaultIds.length === 0 || selectedFaultIds.some((faultId) => faultId === filterItem.faultActionId);
      const statusCodeMatch =
        selectedStatusCodes.length === 0 || selectedStatusCodes.some((code) => code.value === filterItem.statusCode);

      let dateFilter:
        | boolean
        | typeof eventDates
        | typeof supportDocDates
        | typeof counselingDates
        | typeof soldierFlagDates
        | typeof faultRecordDiscoveredDates;

      if (filterType === 'maintainer') {
        dateFilter = eventDates;
      } else if (filterType === 'supporting_documents') {
        dateFilter = supportDocDates;
      } else if (filterType === 'counselings') {
        dateFilter = counselingDates;
      } else if (filterType === 'soldier_flags') {
        dateFilter = soldierFlagDates;
      } else if (filterType === 'fault_records') {
        dateFilter = faultRecordDiscoveredDates;
      } else {
        dateFilter = true;
      }

      let recorderFilter:
        | boolean
        | typeof supportDocumentRecorder
        | typeof counselingRecorder
        | typeof soldierFlagRecorder;

      if (filterType === 'supporting_documents') {
        recorderFilter = supportDocumentRecorder;
      } else if (filterType === 'counselings') {
        recorderFilter = counselingRecorder;
      } else if (filterType === 'soldier_flags') {
        recorderFilter = soldierFlagRecorder;
      } else {
        recorderFilter = true;
      }

      let updatedByFilter: boolean | typeof soldierFlagUpdatedBy;

      if (filterType === 'soldier_flags') {
        updatedByFilter = soldierFlagUpdatedBy;
      } else {
        updatedByFilter = true;
      }

      const filterTypeMatch = filterType === 'ctl' || filterType === 'maintainer' ? mosMatch : true;
      return (
        queryMatch &&
        filterTypeMatch &&
        skillLevelMatch &&
        unitMatch &&
        filterMos &&
        daysUntilDueMatch &&
        filterEventTypes &&
        filterEventInfo &&
        dateFilter &&
        faultRecordClosedDates &&
        filterDocumentType &&
        recorderFilter &&
        updatedByFilter &&
        filterSoldierFlagType &&
        filterSoldierFlagInformation &&
        filterSoldierFlagMXAvailability &&
        filterFaultTypes &&
        wucMatch &&
        statusCodeMatch &&
        faultIdMatch
      );
    });

    setFilteredData(result);
  };

  useEffect(() => {
    applyFilters();
    // setFilterSwitch((prev) => !prev);
  }, [query, selectedMOS, filterSwitch, faultType]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PmxTable
        {...tableProps}
        data={filteredData}
        {...(filterType === 'fault_records' && {
          titleBtn: (
            <Box display="flex" mt={4}>
              <Typography sx={{ mt: 4, mr: 4 }}>Role:</Typography>
              <PmxToggleBtnGroup
                hasSpacing
                hasIcons
                multiple
                buttons={[
                  { label: 'Reporter', value: 'Reporter' },
                  {
                    label: 'Maintainer',
                    value: 'Maintainer',
                  },
                  { label: 'Inspector', value: 'Inspector' },
                  { label: 'Closer', value: 'Closer' },
                ]}
                selected={faultType as FaultType[]}
                onChange={(value) => {
                  setFaultType(value as FaultType[]);
                }}
              />
            </Box>
          ),
        })}
        filters={
          <AmtpTableFilters
            query={query}
            setQuery={setQuery}
            selectedMOS={selectedMOS}
            setSelectedMOS={setSelectedMOS}
            exportData={tableProps.data}
            columns={tableProps.columns}
            fileTitle={convertToSnakeCase((tableProps?.tableTitle as string) ?? 'data')}
            filterType={filterType}
            setFilterSwitch={setFilterSwitch}
          />
        }
      />
    </Box>
  );
};
