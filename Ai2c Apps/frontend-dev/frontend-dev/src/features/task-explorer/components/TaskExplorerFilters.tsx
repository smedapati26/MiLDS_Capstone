import { Box } from '@mui/material';

import { PmxMultiSelect } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { Column } from '@components/PmxTable';
import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { SkillLevel } from '@utils/constants';
import { handleCopy, handleExportCsv, handleExportExcel, handleExportPdf, handlePrint } from '@utils/helpers';

const TaskExplorerFilters = <T extends object>({
  query,
  setQuery,
  selectedMOS,
  setSelectedMOS,
  skillLevel,
  setSkillLevel,
  proponent,
  setProponent,
  fileTitle,
  columns,
  exportData,
}: {
  query: string | undefined;
  setQuery: (val: string) => void;
  selectedMOS: string[];
  setSelectedMOS: (values: string[]) => void;
  skillLevel: string[];
  setSkillLevel: (values: string[]) => void;
  proponent: string[];
  setProponent: (values: string[]) => void;
  fileTitle: string;
  columns: Column<T>[];
  exportData: T[];
}) => {
  const { data: allMOS } = useGetAllMOSQuery();

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
      <Box sx={{ display: 'flex', flex: 1, gap: 2, mr: 100 }}>
        <Box sx={{ flex: 1 }}>
          <PmxMultiSelect
            options={allMOS?.map((x: { mos: string }) => x.mos) ?? []}
            values={selectedMOS}
            label="MOS"
            onChange={(val) => setSelectedMOS(val)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <PmxMultiSelect
            options={Object.values(SkillLevel)}
            values={skillLevel}
            label="Skill Level"
            onChange={(val) => setSkillLevel(val)}
            showSearch={false}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <PmxMultiSelect
            options={['USAACE', 'Unit']}
            values={proponent}
            label="Proponent"
            onChange={(val) => setProponent(val)}
            showSearch={false}
          />
        </Box>
      </Box>

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

export default TaskExplorerFilters;
