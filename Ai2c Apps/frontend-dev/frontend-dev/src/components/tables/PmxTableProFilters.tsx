import { Box } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import { Column } from '@components/PmxTable';
import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';
import { handleCopy, handleExportCsv, handleExportExcel, handleExportPdf, handlePrint } from '@utils/helpers';

const PmxTableProFilters = <T extends object>({
  query,
  setQuery,
  fileTitle,
  columns,
  exportData,
}: {
  query: string | undefined;
  setQuery: (val: string) => void;
  fileTitle: string;
  columns: Column<T>[];
  exportData: T[];
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PmxSearch value={query ?? ''} onChange={(e) => setQuery(e.target.value)} />
        <ExportMenu
          handleCsv={() => handleExportCsv(exportData, fileTitle)}
          handleExcel={() => handleExportExcel(columns, exportData, fileTitle)}
          handlePdf={() => handleExportPdf(columns, exportData, fileTitle)}
          handleCopy={() => handleCopy(columns, exportData)}
          handlePrint={() => handlePrint(columns, exportData, fileTitle)}
        />
      </Box>
    </Box>
  );
};

export default PmxTableProFilters;
