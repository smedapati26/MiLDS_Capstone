import { useEffect, useState } from 'react';

import { Button, Card, CardContent } from '@mui/material';

import { Column } from '@components/PmxTable';
import { PmxTablePro } from '@components/tables';
import { transferCols } from '@features/soldier-manager/constants';
import {
  useAdjudicateSoldierMutation,
  useGetTransferRequestsQuery,
} from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { TransferRequest } from '@store/amap_ai/transfer_request';

import SoldierConfirmationDialog from '../SoldierConfirmationDialog';

type FilterData = TransferRequest;

const TransferRequestsPage = () => {
  const [transferQuery, setTransferQuery] = useState<string>('');
  const [myUserTransferQuery, setMyUserTransferQuery] = useState<string>('');
  const [grantValue, setGrantValue] = useState<boolean>(true);
  const [selectedSolider, setSelectedSoldier] = useState<TransferRequest | undefined>(undefined);

  const { data: adjudicationData, isFetching } = useGetTransferRequestsQuery({
    get_type: 'pending_user_adjudication',
  });
  const transferRequests = adjudicationData?.transferRequests ?? [];

  const { data: userRequestData, isFetching: loadingUserRequests } = useGetTransferRequestsQuery({
    get_type: 'users_pending_requests',
  });

  const [submit, { isLoading }] = useAdjudicateSoldierMutation({});

  const userTransferRequests = userRequestData?.transferRequests ?? [];

  const [trasnferRequests, setTransferRequests] = useState<TransferRequest[]>(transferRequests);

  const [myTransferRequests, setMyTransferRequests] = useState<TransferRequest[]>(userTransferRequests);

  // Filter adjudication transfer requests
  useEffect(() => {
    const noFiltersApplied = transferQuery === '';

    // If no filters are applied, return the original dataset
    if (noFiltersApplied && adjudicationData?.transferRequests) {
      setTransferRequests(adjudicationData?.transferRequests);
    }

    const result = trasnferRequests.filter((item) => {
      const filterItem = item as FilterData;

      const queryMatch =
        transferQuery === '' || Object.values(filterItem).join(' ').toLowerCase().includes(transferQuery.toLowerCase());

      return queryMatch;
    });
    setTransferRequests(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferQuery]);

  // // Filter pending soldier transfer requests
  useEffect(() => {
    const noFiltersApplied = myUserTransferQuery === '';

    // If no filters are applied, return the original dataset
    if (noFiltersApplied && userRequestData?.transferRequests) {
      setMyTransferRequests(userRequestData?.transferRequests);
    }

    const result = myTransferRequests.filter((item) => {
      const filterItem = item as FilterData;

      const queryMatch =
        myUserTransferQuery === '' ||
        Object.values(filterItem).join(' ').toLowerCase().includes(myUserTransferQuery.toLowerCase());

      return queryMatch;
    });
    setMyTransferRequests(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserTransferQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGrantValue(Boolean((event.target as HTMLInputElement).value));
  };

  const handleSubmit = () => {
    submit({
      soldier_ids: [selectedSolider?.soldierUserId ?? ''],
      gaining_uic: selectedSolider?.gainingUnitUic ?? '',
      grant: grantValue,
    });
  };

  return (
    <>
      <Card
        sx={{
          border: '1px solid transparent',
          '&:hover': {
            borderColor: 'transparent',
          },
        }}
      >
        <CardContent>
          <PmxTablePro
            tableProps={{
              data: trasnferRequests ?? [],
              columns: [
                ...transferCols,
                {
                  field: 'managers',
                  header: 'Actions',
                  renderCell: (_value, row) => {
                    return (
                      <Button sx={{ textTransform: 'uppercase' }} onClick={() => setSelectedSoldier(row)}>
                        Approve/Deny
                      </Button>
                    );
                  },
                },
              ] as Column<TransferRequest>[],
              isLoading: isFetching,
              tableTitle: 'Transfer Requests - Received',
              getRowId: (val: TransferRequest) => val.soldierUserId,
            }}
            query={transferQuery}
            setQuery={setTransferQuery}
          />
        </CardContent>
      </Card>
      <Card
        sx={{
          mt: 4,
          border: '1px solid transparent',
          '&:hover': {
            borderColor: 'transparent',
          },
        }}
      >
        <CardContent>
          <PmxTablePro
            tableProps={{
              data: myTransferRequests ?? [],
              columns: transferCols as Column<TransferRequest>[],
              isLoading: loadingUserRequests,
              tableTitle: 'Transfer Requests - Sent',
              getRowId: (val: TransferRequest) => val.soldierUserId,
            }}
            query={myUserTransferQuery}
            setQuery={setMyUserTransferQuery}
          />
        </CardContent>
      </Card>

      <SoldierConfirmationDialog
        open={!!selectedSolider}
        selectedSolider={selectedSolider as TransferRequest}
        setSelectedSoldier={setSelectedSoldier}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        isLoading={isLoading}
      />
    </>
  );
};

export default TransferRequestsPage;
