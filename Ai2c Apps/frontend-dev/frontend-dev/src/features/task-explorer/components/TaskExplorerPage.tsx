import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useGetAllTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';

import { ITasks } from '../models';
import TaskExplorerTable from './TaskExplorerTable';

const TaskExplorerPage = () => {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState<string | undefined>(query);
  const [selectedMOS, setSelectedMOS] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string[]>([]);
  const [proponent, setProponent] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const { data, isFetching } = useGetAllTasksQuery({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
    query: debouncedQuery,
    mos: selectedMOS ?? undefined,
    skill_level: skillLevel ?? undefined,
    proponent: proponent ?? undefined,
  });

  const total = data?.totalCount ?? 0;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, skillLevel]);

  return (
    <Box>
      <Box display="flex" mb={2}>
        <Typography variant="h4">Task Explorer</Typography>
      </Box>

      <Box>
        <TaskExplorerTable
          tableProps={{
            data: isFetching ? [] : (data?.data ?? []),
            columns: [
              { field: 'taskNumber', header: 'Task #' },
              { field: 'taskTitle', header: 'Task Title' },
              { field: 'trainingLocation', header: 'Training Location' },
              { field: 'frequency', header: 'Frequency' },
              { field: 'subjectArea', header: 'Subject Area' },
              { field: 'proponent', header: 'Proponent' },
              { field: 'skillLevel', header: 'SL' },
              { field: 'mosCode', header: 'MOS' },
              { field: 'unit', header: 'Unit' },
            ],
            getRowId: (task: ITasks) => `${task.taskNumber}-${task.taskTitle}-${task.skillLevel}-${task.mosCode}`,
            isLoading: isFetching,
            tablePage: page,
            tableRowsPerPage: rowsPerPage,
            count: total,
            onPageChange: (_, newPage) => setPage(newPage),
            onRowsPerPageChange: (e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            },
          }}
          query={query}
          setQuery={setQuery}
          selectedMOS={selectedMOS}
          setSelectedMOS={setSelectedMOS}
          skillLevel={skillLevel}
          setSkillLevel={setSkillLevel}
          proponent={proponent}
          setProponent={setProponent}
        />
      </Box>
    </Box>
  );
};

export default TaskExplorerPage;
