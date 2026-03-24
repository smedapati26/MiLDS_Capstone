import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { PmxTable, PmxTableProps } from '@components/PmxTable';

import PmxTableProFilters from './PmxTableProFilters';

const PmxTablePro = <T extends object, U extends object>({
  tableTitle,
  tableProps,
  query,
  setQuery,
  exportFileTitle = 'data',
}: {
  tableTitle?: string;
  tableProps: PmxTableProps<T, U>;
  query: string;
  setQuery: (val: string) => void;
  exportFileTitle?: string;
}) => {
  const [filteredData, setFilteredData] = useState<T[]>(tableProps.data);

  useEffect(() => {
    setFilteredData(tableProps.data);
  }, [tableProps.data]);

  return (
    <Box>
      {tableTitle && (
        <Box display="flex" mb={2}>
          <Typography variant="h4">{tableTitle}</Typography>
        </Box>
      )}

      <PmxTable
        {...tableProps}
        data={filteredData}
        filters={
          <PmxTableProFilters
            query={query}
            setQuery={setQuery}
            exportData={tableProps.data}
            columns={tableProps.columns}
            fileTitle={exportFileTitle}
          />
        }
      />
    </Box>
  );
};

export default PmxTablePro;
