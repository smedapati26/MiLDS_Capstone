import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { PmxTable, PmxTableProps } from '@components/PmxTable';

import TaskExplorerFilters from './TaskExplorerFilters';

const TaskExplorerTable = <T extends object, U extends object>({
  tableProps,
  query,
  setQuery,
  selectedMOS,
  setSelectedMOS,
  skillLevel,
  setSkillLevel,
  proponent,
  setProponent,
}: {
  tableProps: PmxTableProps<T, U>;
  query: string | undefined;
  selectedMOS: string[];
  skillLevel: string[];
  proponent: string[];
  setProponent: (values: string[]) => void;
  setSkillLevel: (val: string[]) => void;
  setSelectedMOS: (values: string[]) => void;
  setQuery: (val: string) => void;
}) => {
  const [filteredData, setFilteredData] = useState<T[]>(tableProps.data);

  useEffect(() => {
    setFilteredData(tableProps.data);
  }, [tableProps.data]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" fontWeight="normal" pt={4} pb={4}>
        Individual Critical Task List
      </Typography>
      <TaskExplorerFilters
        query={query}
        setQuery={setQuery}
        selectedMOS={selectedMOS}
        setSelectedMOS={setSelectedMOS}
        skillLevel={skillLevel}
        setSkillLevel={setSkillLevel}
        exportData={tableProps.data}
        columns={tableProps.columns}
        fileTitle={'all_tasks_data'}
        proponent={proponent}
        setProponent={setProponent}
      />
      <PmxTable {...tableProps} data={filteredData} />
    </Box>
  );
};

export default TaskExplorerTable;
