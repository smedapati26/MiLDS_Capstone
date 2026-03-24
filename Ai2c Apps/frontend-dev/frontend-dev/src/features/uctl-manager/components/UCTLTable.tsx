import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import PmxSearchSplitButton from '@components/PmxSearchSplitButton';
import { PmxTable, PmxTableProps } from '@components/PmxTable';
import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';
import { ITasks } from '@features/task-explorer';
import { handleCopy, handleExportCsv, handleExportExcel, handleExportPdf, handlePrint } from '@utils/helpers';

import AddMultipleTasksDialog from './AddMultipleTasksDialog';

interface UCTLTableProps<T extends object, U extends object> {
  tableProps: PmxTableProps<T, U>;
  allTasks?: { id: string; value: string }[];
  selectedTasks?: ITasks[];
  setSelectedTasks?: (val: string) => void;
}

const UCTLTable = <T extends object, U extends object>({
  tableProps,
  allTasks,
  setSelectedTasks,
  selectedTasks,
}: UCTLTableProps<T, U>) => {
  const [query, setQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<T[]>(tableProps.data);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();

    const filtered = tableProps.data.filter((row) =>
      Object.values(row).some((value) => typeof value === 'string' && value.toLowerCase().includes(lowerQuery)),
    );

    setFilteredData(filtered);
  }, [query, tableProps.data]);

  // Add selected tasks from dialog
  useEffect(() => {
    if (allTasks && selectedTasks && setSelectedTasks) {
      selectedIds.forEach((id) => {
        const matched = allTasks.find((task) => task.id === id);
        if (matched && !selectedTasks.some((t) => t.taskNumber === matched.id)) {
          setSelectedTasks(matched.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  return (
    <>
      <Box
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.3s ease',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '4px',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          '&:hover': {
            scrollbarColor: 'rgba(0, 0, 0, 0.3) transparent',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {allTasks && selectedTasks && (
            <Box sx={{ mb: 3 }}>
              <PmxSearchSplitButton
                buttonTitle="ADD TASK"
                options={
                  selectedTasks?.length > 0
                    ? allTasks.filter((task) => !selectedTasks.some((sel) => sel.taskNumber === task.id))
                    : allTasks
                }
                onSelect={(option) => setSelectedTasks && setSelectedTasks(option.id)}
                extraAction={{
                  label: 'Add Multiple Tasks',
                  onClick: () => setDialogOpen(true),
                  startAdornment: <AddIcon color="primary" fontSize="small" />,
                }}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1, mb: 3 }}>
            <PmxSearch value={query ?? ''} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>

          <ExportMenu
            handleCsv={() => handleExportCsv(tableProps.data, 'uctl_data')}
            handleExcel={() => handleExportExcel(tableProps.columns, tableProps.data, 'uctl_data')}
            handlePdf={() => handleExportPdf(tableProps.columns, tableProps.data, 'uctl_data')}
            handleCopy={() => handleCopy(tableProps.columns, tableProps.data)}
            handlePrint={() => handlePrint(tableProps.columns, tableProps.data, 'uctl_data')}
          />
        </Box>

        <PmxTable {...tableProps} data={filteredData} enforceHeight={false} />
      </Box>

      {allTasks && (
        <AddMultipleTasksDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          allTasks={allTasks}
          selectedTaskIds={selectedIds}
          onUpdateSelected={setSelectedIds}
        />
      )}
    </>
  );
};

export default UCTLTable;
