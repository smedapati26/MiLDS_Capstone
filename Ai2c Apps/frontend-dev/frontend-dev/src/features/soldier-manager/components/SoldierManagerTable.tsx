import { useEffect, useState } from 'react';

import { useSnackbar } from '@context/SnackbarProvider';
import { Box } from '@mui/material';

import { Column } from '@components/PmxTable';
import { PmxGroupData, PmxGroupedTable } from '@components/tables';
import { IUnitBrief } from '@store/amap_ai/units/models';

import { useSubmitTransferMutation } from '../../../store/amap_ai/transfer_request/slices/transferRequestsApi';
import SoldierManagerFilters, { SoldierTypes } from './SoldierManagerFilters';
import SoldierTransferDialog from './SoldierTransferDialog';

function hasNameAndDodId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
): obj is { name: string; dodId: string; isMaintainer: boolean; isAmtpMaintainer: boolean } {
  return typeof obj?.name === 'string' && typeof obj?.dodId === 'string';
}

const SoldierManagerTable = <T extends object & { dodId?: string }>({
  data,
  columns,
  selectedRows,
  filtersDisabled,
  showTransfer,
  transferFromGroup,
  transferToGroup,
  gainingUnit,
  loading,
  onSelectionChange,
}: {
  data: Array<{
    id: string;
    label: React.ReactNode;
    children: T[];
  }>;
  gainingUnit?: IUnitBrief | undefined;
  columns: Column<T>[];
  selectedRows?: T[] & { dodId: string };
  filtersDisabled: boolean;
  showTransfer: boolean;
  transferFromGroup?: string;
  transferToGroup?: string;
  loading?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}) => {
  const { showAlert } = useSnackbar();
  const [transferOpen, setTransferOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [soldierType, setSoldierType] = useState<SoldierTypes>(undefined);
  const [filteredData, setFilteredData] = useState<PmxGroupData<T>>(data);

  const [submitTransfer, { isLoading }] = useSubmitTransferMutation();

  useEffect(() => {
    const filtered = data
      ?.map((group) => ({
        ...group,
        children: group.children.filter((child) => {
          if (!hasNameAndDodId(child)) return false;

          const matchesQuery = child.name.toLowerCase().includes(query.toLowerCase());

          const matchesMaintainer =
            soldierType === 'all_maintainers'
              ? child.isMaintainer
              : // eslint-disable-next-line sonarjs/no-nested-conditional
                soldierType === 'amtp_maintainers'
                ? child.isAmtpMaintainer
                : true;

          return matchesQuery && matchesMaintainer;
        }),
      }))
      .filter((group) => group.children.length > 0);

    setFilteredData(filtered);
  }, [data, query, soldierType]);

  const handleTransfer = async () => {
    const selectedDodIds = selectedRows?.map((s) => s.dodId) ?? [];
    const gainingUic = gainingUnit?.uic ?? transferToGroup;

    try {
      const res = await submitTransfer({
        soldier_ids: selectedDodIds as string[],
        gaining_uic: gainingUic as string,
      });

      if (res.error) {
        showAlert(
          `Error submitting transfer request for ${selectedDodIds.length} soldier(s). Please contact administration.`,
          'error',
        );
      } else {
        showAlert(`Transfer Request Submitted for ${selectedDodIds.length} soldier(s).`, 'success');
      }
    } catch (err) {
      console.error('Transfer failed', err);
      showAlert(`Unexpected error submitting transfer request. Please contact administration.`, 'error');
    } finally {
      setTransferOpen(false);
      onSelectionChange && onSelectionChange([]);
    }
  };

  const getTransferLabel = () => {
    if (transferToGroup === 'all') {
      return gainingUnit?.displayName ?? '';
    } else if (transferToGroup === 'TRANSIENT') {
      return 'Soldiers In Transit';
    } else {
      return 'Soldiers Pending ETS';
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SoldierManagerFilters
          query={query}
          setQuery={setQuery}
          soldierType={soldierType}
          setSoldierType={setSoldierType}
          filtersDisabled={filtersDisabled}
          showTransfer={showTransfer}
          handleTransfer={() => setTransferOpen(true)}
          isSubmitting={isLoading}
          submitDisabled={selectedRows?.length === 0 || (transferToGroup === 'all' && !gainingUnit)}
          transferFromGroup={transferFromGroup as string}
        />
        <PmxGroupedTable
          columns={columns as Column<T>[]}
          data={filteredData as PmxGroupData<T>}
          isExpandable={false}
          selectableRows
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          loading={loading}
        />
      </Box>

      <SoldierTransferDialog
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        data={data}
        isLoading={isLoading}
        open={transferOpen}
        handleClose={() => setTransferOpen(false)}
        handleSubmit={handleTransfer}
        newUnit={getTransferLabel()}
      />
    </>
  );
};

export default SoldierManagerTable;
