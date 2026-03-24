import React, { useEffect, useState } from 'react';

import { Box, Stack, styled, useTheme } from '@mui/material';

import { EnumOption, PmxTable, SearchBar } from '@ai2c/pmx-mui';

import { AircraftDropdown } from '@components/dropdowns';
import { IColumnMapping } from '@models/IColumnMapping';
import { getNumberColor, roundDecimal } from '@utils/helpers';
import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import { IShortLife } from '@store/griffin_api/components/models';
import { useGetShortLifeQuery } from '@store/griffin_api/components/slices';
import { useAppSelector } from '@store/hooks';

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  alignItems: 'center',
}));

const StyledHeading = styled('h6')(({ theme }) => ({
  fontFamily: 'Roboto',
  fontWeight: 500,
  margin: 0,
  marginBottom: theme.spacing(1),
  fontSize: '20px',
}));

// Column definitions with their corresponding data fields
export const COMPONENT_TABLE_COLUMNS: IColumnMapping<IShortLife>[] = [
  { header: 'A/C Serial Number', field: 'aircraftSerialNumber', width: '10%' },
  { header: 'Model', field: 'aircraftModel', width: '10%' },
  { header: 'Part Description', field: 'nomenclature', width: '15%' },
  { header: 'WUC', field: 'workUnitCode', width: '10%' },
  { header: 'Part Number', field: 'partNumber', width: '10%' },
  { header: 'Serial Number', field: 'serialNumber', width: '10%' },
  { header: 'Variable', field: 'trackerName', width: '8%' },
  { header: 'Component Age', field: 'currentValue', width: '8%' },
  { header: 'Mandatory', field: 'replacementDue', width: '8%' },
  { header: 'Expected', field: 'hoursRemaining', width: '8%' },
];

export const ComponentOverviewTab: React.FC = () => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  const [filteredData, setFilteredData] = useState<IShortLife[] | undefined>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof IShortLife | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { data, isLoading, error } = useGetShortLifeQuery({
    uic,
    include_na: 'false',
  });

  const sortedData = React.useMemo(() => {
    if (!filteredData || !sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
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
  }, [filteredData, sortBy, sortOrder]);

  useEffect(() => {
    const updatedData = data?.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesModel = selectedModels.length > 0 ? selectedModels.includes(item.aircraftModel) : true;
      const matchesSerial = selectedSerials.length > 0 ? selectedSerials.includes(item.aircraftSerialNumber) : true;
      return matchesSearch && matchesModel && matchesSerial;
    });
    setFilteredData(updatedData);
  }, [data, selectedModels, selectedSerials, searchQuery]);

  const theme = useTheme();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSortRequest = (field: keyof IShortLife, direction: 'asc' | 'desc') => {
    setSortOrder(direction);
    setSortBy(field);
    setPage(0);
  };

  const searchOptions = React.useMemo(() => {
    if (!data) return [];

    // Apply model and serial filters first
    const preFilteredData = data.filter((item) => {
      const matchesModel = selectedModels.length > 0 ? selectedModels.includes(item.aircraftModel) : true;
      const matchesSerial = selectedSerials.length > 0 ? selectedSerials.includes(item.aircraftSerialNumber) : true;
      return matchesModel && matchesSerial;
    });

    const options = new Set<string>();

    preFilteredData.forEach((item) => {
      COMPONENT_TABLE_COLUMNS.forEach((column) => {
        const value = item[column.field];
        if (value !== undefined && value !== null) {
          const formattedValue =
            typeof value === 'number' ? (roundDecimal(value, 2)?.toString() ?? value.toString()) : value.toString();
          options.add(formattedValue);
        }
      });
    });

    return Array.from(options).map((value) => ({
      value,
      label: value,
    }));
  }, [data, selectedModels, selectedSerials]);

  const handleSearch = (_event: React.SyntheticEvent, value: EnumOption | null) => {
    setSearchQuery(value ? value.value.toString() : '');
    setPage(0);
  };

  const paginatedData = React.useMemo(() => {
    if (!sortedData) return [];
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const tableColumns = COMPONENT_TABLE_COLUMNS.map((column) => ({
    ...column,
    renderCell: (value: IShortLife[keyof IShortLife]) => {
      if (typeof value === 'number' || !isNaN(Number(value))) {
        return (
          <Box
            component="span"
            sx={{
              color: getNumberColor(value, 0, theme) ?? 'inherit',
            }}
          >
            {roundDecimal(value, 2) ?? '--'}
          </Box>
        );
      }
      return value ?? '--';
    },
  }));

  return (
    <Stack gap={3}>
      <StyledHeading>TBO/Short Life Table</StyledHeading>
      <FilterContainer>
        <AircraftDropdown selected={selectedModels} handleSelect={setSelectedModels} />
        <AircraftDropdown
          selected={selectedSerials}
          handleSelect={setSelectedSerials}
          label="Serial Numbers"
          aircraftType="serial"
        />
        <SearchBar
          options={searchOptions}
          variant="standard"
          color="default"
          onChange={(_event, value) => handleSearch(_event, value)}
          styles={{
            marginLeft: 'auto',
            width: 260,
            marginRight: 0,
            alignSelf: 'flex-end',
          }}
        />
      </FilterContainer>
      <PmxTable
        columns={tableColumns}
        data={paginatedData}
        isLoading={isLoading}
        error={error}
        getRowId={(row: IShortLife) => row.id || generateUniqueId()}
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
        totalCount={filteredData?.length ?? 0}
      />
    </Stack>
  );
};

export default ComponentOverviewTab;
