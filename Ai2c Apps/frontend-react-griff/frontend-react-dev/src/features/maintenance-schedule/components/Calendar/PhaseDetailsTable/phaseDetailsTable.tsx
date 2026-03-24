import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { PmxTable } from '@ai2c/pmx-mui';

import { IColumnMapping } from '@models/IColumnMapping';

import { IUpcomingMaintenance } from '@store/griffin_api/events/models';
import { useGetLanesQuery } from '@store/griffin_api/events/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

const PHASE_TABLE_COLUMNS: IColumnMapping<IUpcomingMaintenance>[] = [
  { header: 'Serial #', field: 'serialNumber', width: '14%' },
  { header: 'Model', field: 'aircraftModel', width: '10%' },
  { header: 'Inspection', field: 'inspectionName', width: '24%' },
  { header: 'Lane', field: 'lane', width: '24%' },
  { header: 'Start Date', field: 'eventStart', width: '14%' },
  { header: 'End Date', field: 'eventEnd', width: '14%' },
];

/**
 *
 * @param {IUpcomingMaintenance} data List of upcoming phase events for the currently selected global unit
 * @returns {PmxTable} PMX table of upcoming phases for the currently selected global unit
 */

export const PhaseDetailsTable: React.FC<{ data: IUpcomingMaintenance[] }> = ({ data }) => {
  const currentUic = useAppSelector(selectCurrentUic);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof IUpcomingMaintenance | null>('eventStart');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { data: lanes } = useGetLanesQuery(currentUic);

  const sortedData = React.useMemo(() => {
    if (!data || !sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle numeric and string sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortBy, sortOrder]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSortRequest = (field: keyof IUpcomingMaintenance, direction: 'asc' | 'desc') => {
    setSortOrder(direction);
    setSortBy(field);
    setPage(0);
  };

  const paginatedData = React.useMemo(() => {
    if (!sortedData) return [];
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);
  // IUpcomingMaintenance has lane id, get actual lane name
  const laneMap = React.useMemo(() => {
    if (!lanes) return {};
    return lanes.reduce(
      (acc, lane) => {
        acc[lane.id] = lane.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [lanes]);
  // Make sure date is in correct format in table
  const formatDate = (date: string | null) => {
    return date ? dayjs(date).format('DD MMM YY').toUpperCase() : '--';
  };

  // Use Last 3 digits of serial to conserve space if window is very small
  const formatAircraftSerial = (serial: string | null) => {
    if (windowWidth < 1200) {
      return serial ? serial.slice(-3) : '--';
    }
    return serial ?? '--';
  };

  const tableColumns = PHASE_TABLE_COLUMNS.map((column) => ({
    ...column,
    renderCell: (value: IUpcomingMaintenance[keyof IUpcomingMaintenance]) => {
      if (column.field === 'lane') {
        return laneMap[value as string] || 'Unknown Lane'; // Replace ID with name
      }
      if (column.field === 'eventStart' || column.field === 'eventEnd') {
        return formatDate(value as string);
      }
      if (column.field === 'serialNumber') {
        return formatAircraftSerial(value as string); // use last 3 on very small window
      }
      return value ?? '--';
    },
  }));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        overflowX: 'scroll',
        overflowY: 'scroll',
        maxHeight: '400px',
        maxWidth: '100%',
      }}
    >
      <PmxTable
        columns={tableColumns}
        data={paginatedData}
        getRowId={(row: IUpcomingMaintenance) => row.id}
        onSort={handleSortRequest}
        sortBy={sortBy ?? undefined}
        sortOrder={sortOrder}
        page={page}
        onPageChange={(newPage: number) => handleChangePage(null, newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(newRowsPerPage: number) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        totalCount={data?.length ?? 0}
      />
    </div>
  );
};

export default PhaseDetailsTable;
