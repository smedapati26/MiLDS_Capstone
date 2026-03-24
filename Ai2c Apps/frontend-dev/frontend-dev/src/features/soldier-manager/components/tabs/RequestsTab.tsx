import { useEffect, useMemo, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { Link } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import { IUnitReceivedTransferRequest, IUnitSentTransferRequest } from '@store/amap_ai/soldier_manager';
import { useGetTransferRequestsQuery } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';
import { ISoldierPermissionRequest, IUnitPermissionRequest } from '@store/amap_ai/user_request';
import { useGetPermissionRequestsQuery } from '@store/amap_ai/user_request/slices/userRequestApiSlice';

import TransferReviewDialog, { TransferItem } from '../TransferReviewDialog';

const RequestsTab = () => {
  const theme = useTheme();
  const [checkedPermissionIds, setCheckedPermissionIds] = useState<number[]>([]);
  const [checkedTransferIds, setCheckedTransferIds] = useState<number[]>([]);
  const [transferState, setTransferState] = useState<string>('Received');
  const { data: transferData, refetch: refetchTransferRequests } = useGetTransferRequestsQuery();
  const { data: permissionData, refetch: refetchPermissionRequests } = useGetPermissionRequestsQuery();
  const [transferType, setTransferType] = useState<'Approve' | 'Reject'>('Approve');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [showTransferDialog, setShowTransferDialog] = useState<boolean>(false);
  const [permissionRequests, setPermissionRequests] = useState<IUnitPermissionRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<{
    receivedRequests: IUnitReceivedTransferRequest[];
    sentRequests: IUnitSentTransferRequest[];
  }>({ receivedRequests: [], sentRequests: [] });
  const [permissionSearch, setPermissionSearch] = useState<string>('');
  const [transferSearch, setTransferSearch] = useState<string>('');

  useEffect(() => {
    if (transferData) setTransferRequests(transferData);
  }, [transferData]);

  useEffect(() => {
    if (permissionData) setPermissionRequests(permissionData);
  }, [permissionData]);

  const StyledLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:active, &:visited, &:hover': {
      color: theme.palette.primary.main,
    },
  }));

  const filteredPermissionRequests = permissionRequests.filter((unit) => {
    if (permissionSearch.length === 0) {
      return true;
    } else {
      const unitMatch = unit.unitName.includes(permissionSearch);

      const soldierMatch = unit.requests.some((soldier) => {
        const soldierNameMatch = soldier.name.includes(permissionSearch);
        const soldierRankMatch = soldier.rank ? soldier.rank.includes(permissionSearch) : false;
        const soldierDodMatch = soldier.dodId.includes(permissionSearch);
        const soldierCurrentRole = soldier.currentRole ? soldier.currentRole.includes(permissionSearch) : false;
        const soldierRequestedRole = soldier.requestedRole.includes(permissionSearch);

        return soldierNameMatch || soldierRankMatch || soldierDodMatch || soldierCurrentRole || soldierRequestedRole;
      });

      return unitMatch || soldierMatch;
    }
  });

  const filterteredSentTransferRequests = transferRequests.sentRequests.filter((soldier) => {
    if (!transferSearch) return true;

    const query = transferSearch.toLowerCase();
    const soldierNameMatch = soldier.name?.toLowerCase().includes(query);
    const soldierRankMatch = soldier.rank?.toLowerCase().includes(query);
    const soldierDodMatch = soldier.dodId?.toLowerCase().includes(query);
    const soldierCurrentUnit = soldier.currentUnit?.toLowerCase().includes(query);
    const soldierCurrentUnitUic = soldier.currentUnitUic?.toLowerCase().includes(query);
    const soldierRequestingUnit = soldier.requestingUnit?.toLowerCase().includes(query);
    const soldierRequestingUnitUic = soldier.requestingUnitUic?.toLowerCase().includes(query);

    return (
      soldierNameMatch ||
      soldierRankMatch ||
      soldierDodMatch ||
      soldierCurrentUnit ||
      soldierCurrentUnitUic ||
      soldierRequestingUnit ||
      soldierRequestingUnitUic
    );
  });

  const filteredReceivedRequests = transferRequests.receivedRequests.filter((soldier) => {
    if (!transferSearch) return true;

    const query = transferSearch.toLowerCase();

    const soldierNameMatch = soldier.name?.toLowerCase().includes(query);
    const soldierRankMatch = soldier.rank?.toLowerCase().includes(query);
    const soldierDodMatch = soldier.dodId?.toLowerCase().includes(query);
    const soldierCurrentUnit = soldier.currentUnit?.toLowerCase().includes(query);
    const soldierCurrentUnitUic = soldier.currentUnitUic?.toLowerCase().includes(query);
    const soldierRequestingUnit = soldier.requestingUnit?.toLowerCase().includes(query);
    const soldierRequestingUnitUic = soldier.requestingUnitUic?.toLowerCase().includes(query);
    const soldierRequestingSoldier = soldier.requestedBy?.toLowerCase().includes(query);

    return (
      soldierNameMatch ||
      soldierRankMatch ||
      soldierDodMatch ||
      soldierCurrentUnit ||
      soldierCurrentUnitUic ||
      soldierRequestingUnit ||
      soldierRequestingUnitUic ||
      soldierRequestingSoldier
    );
  });

  const confirmPermissonRequest = (request_ids: number[], type: 'Approve' | 'Reject') => {
    const selectedRequests = permissionRequests.flatMap((group) =>
      group.requests.filter((req) => request_ids.includes(req.requestId)),
    );

    const mapped: TransferItem[] = selectedRequests.map((req) => ({
      type: 'permission',
      requestId: req.requestId,
      name: req.name,
      rank: req.rank,
      dodId: req.dodId,
      unit: req.unit,
      lastActive: req.lastActive,
      currentRole: req.currentRole,
      requestedRole: req.requestedRole,
    }));

    setTransferItems(mapped);
    setTransferType(type);
    setShowTransferDialog(true);
  };

  const confirmTransferRequest = (request_ids: number[], type: 'Approve' | 'Reject') => {
    const selected = transferRequests.receivedRequests.filter((req) => request_ids.includes(req.requestId));

    const mapped: TransferItem[] = selected.map((req) => ({
      type: 'transfer',
      requestId: req.requestId,
      name: req.name,
      rank: req.rank,
      dodId: req.dodId,
      fromUnit: req.currentUnit,
      fromUic: req.currentUnitUic,
      toUnit: req.requestingUnit,
      requestedBy: req.requestedBy,
    }));

    setTransferItems(mapped);
    setTransferType(type);
    setShowTransferDialog(true);
  };

  const warningEnable = useMemo(() => {
    if (theme.palette.mode === 'light') {
      return theme.palette.error.dark;
    } else {
      return theme.palette.error.light;
    }
  }, [theme]);

  const warningDisable = useMemo(() => {
    if (theme.palette.mode === 'light') {
      return theme.palette.error.l40;
    } else {
      return theme.palette.error.d40;
    }
  }, [theme]);

  const handleClickUnitPermission = (requests: ISoldierPermissionRequest[]) => {
    const unitRequestIds = requests.map((req) => req.requestId);
    const containsAll = requests.every((req) => checkedPermissionIds.includes(req.requestId));

    if (containsAll) {
      setCheckedPermissionIds((prev) => prev.filter((req) => !unitRequestIds.includes(req)));
    } else {
      setCheckedPermissionIds((prev) => [...prev, ...unitRequestIds]);
    }
  };

  const handleClickUnitTransfer = () => {
    if (checkedTransferIds.length > 0) {
      setCheckedTransferIds([]);
    } else {
      setCheckedTransferIds(transferRequests.receivedRequests.map((req) => req.requestId));
    }
  };

  const checkUnitChecked = (requests: ISoldierPermissionRequest[]) => {
    const containsAll: boolean = requests.every((request) => checkedPermissionIds.includes(request.requestId)) ?? false;
    return containsAll;
  };

  return (
    <Box>
      <Accordion sx={{ mb: 4, px: 2 }}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Typography variant="body2">Permission Requests</Typography>
            <Divider orientation="vertical" />
            <Chip color="primary" size="small" label={permissionRequests.flatMap((unit) => unit.requests).length} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon sx={{ fill: `${theme.palette.text.contrastText} !important` }} />}
                disabled={checkedPermissionIds.length === 0}
                onClick={() => confirmPermissonRequest(checkedPermissionIds, 'Approve')}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={
                  <CloseIcon
                    sx={{ fill: `${checkedPermissionIds.length > 0 ? warningEnable : warningDisable} !important` }}
                  />
                }
                disabled={checkedPermissionIds.length === 0}
                onClick={() => confirmPermissonRequest(checkedPermissionIds, 'Reject')}
              >
                Reject
              </Button>
            </Box>
            <PmxSearch
              value={permissionSearch}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPermissionSearch(event.target.value)}
            />
          </Box>
          <Box
            sx={{
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.palette.divider,
              '& .MuiAccordion-root': { my: '0 !important' },
            }}
          >
            {filteredPermissionRequests.map((unit) => (
              <Accordion
                key={`${unit.unitUic}-permissions`}
                sx={{ backgroundColor: theme.palette.layout.background16, my: -1, p: 0 }}
                square
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  sx={{ flexDirection: 'row-reverse', mr: 0, ml: 1 }}
                >
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {unit.unitName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, m: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.layout.background16 }}>
                          <TableCell>
                            <Checkbox
                              checked={checkUnitChecked(unit.requests)}
                              onClick={() => handleClickUnitPermission(unit.requests)}
                            />
                          </TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Rank</TableCell>
                          <TableCell>DoD ID Number</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Last Active</TableCell>
                          <TableCell>Current Role</TableCell>
                          <TableCell>Requested Role</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unit.requests.map((request) => (
                          <TableRow key={request.requestId}>
                            <TableCell>
                              <Checkbox
                                checked={checkedPermissionIds.includes(request.requestId)}
                                onClick={() =>
                                  // eslint-disable-next-line sonarjs/no-nested-functions
                                  setCheckedPermissionIds((prev) =>
                                    prev.includes(request.requestId)
                                      ? prev.filter((req) => req !== request.requestId)
                                      : [...prev, request.requestId],
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.rank}</TableCell>
                            <TableCell>{request.dodId}</TableCell>
                            <TableCell>{request.unit}</TableCell>
                            <TableCell>{request.lastActive}</TableCell>
                            <TableCell>{request.currentRole}</TableCell>
                            <TableCell>{request.requestedRole}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => confirmPermissonRequest([request.requestId], 'Approve')}>
                                <CheckIcon />
                              </IconButton>
                              <IconButton onClick={() => confirmPermissonRequest([request.requestId], 'Reject')}>
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 4, px: 2 }}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Typography variant="body2">Transfer Requests</Typography>
            <Divider orientation="vertical" />
            <Chip color="primary" size="small" label={transferRequests.receivedRequests.length} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pb: 8 }}>
          <ToggleButtonGroup
            color="primary"
            value={transferState}
            exclusive
            onChange={(_event: React.MouseEvent<HTMLElement>, value: string) => setTransferState(value)}
            sx={{ pb: 2 }}
          >
            <ToggleButton value="Received">Received</ToggleButton>
            <ToggleButton value="Sent">Sent</ToggleButton>
          </ToggleButtonGroup>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: transferState === 'Received' ? 'space-between' : 'flex-end',
              pb: 4,
            }}
          >
            {transferState === 'Received' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon sx={{ fill: `${theme.palette.text.contrastText} !important` }} />}
                  disabled={checkedTransferIds.length === 0}
                  onClick={() => confirmTransferRequest(checkedTransferIds, 'Approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={
                    <CloseIcon
                      sx={{ fill: `${checkedTransferIds.length > 0 ? warningEnable : warningDisable} !important` }}
                    />
                  }
                  disabled={checkedTransferIds.length === 0}
                  onClick={() => confirmTransferRequest(checkedTransferIds, 'Reject')}
                >
                  Reject
                </Button>
              </Box>
            )}
            <PmxSearch
              value={transferSearch}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTransferSearch(event.target.value)}
            />
          </Box>
          {transferState === 'Received' ? (
            <Box
              sx={{
                my: 2,
                borderWidth: '2px',
                borderColor: theme.palette.divider,
                borderStyle: 'solid',
                borderRadius: '4px',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.layout.background16 }}>
                      <TableCell>
                        <Checkbox
                          checked={checkedTransferIds.length >= transferRequests.receivedRequests.length}
                          onClick={handleClickUnitTransfer}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>DoD ID Number</TableCell>
                      <TableCell>Current Unit</TableCell>
                      <TableCell>Requesting Unit</TableCell>
                      <TableCell>Requested By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReceivedRequests.map((request) => (
                      <TableRow key={request.requestId}>
                        <TableCell>
                          <Checkbox
                            checked={checkedTransferIds.includes(request.requestId)}
                            onClick={() =>
                              setCheckedTransferIds((prev) =>
                                prev.includes(request.requestId)
                                  ? // eslint-disable-next-line sonarjs/no-nested-functions
                                    prev.filter((req) => req !== request.requestId)
                                  : [...prev, request.requestId],
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.rank}</TableCell>
                        <TableCell>{request.dodId}</TableCell>
                        <TableCell>{request.currentUnit}</TableCell>
                        <TableCell>{request.requestingUnit}</TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => confirmTransferRequest([request.requestId], 'Approve')}>
                            <CheckIcon />
                          </IconButton>
                          <IconButton onClick={() => confirmTransferRequest([request.requestId], 'Reject')}>
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box
              sx={{
                my: 2,
                borderWidth: '2px',
                borderColor: theme.palette.divider,
                borderStyle: 'solid',
                borderRadius: '4px',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.layout.background16 }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>DoD ID Number</TableCell>
                      <TableCell>Current Unit</TableCell>
                      <TableCell>Requesting Unit</TableCell>
                      <TableCell>POC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterteredSentTransferRequests.map((request) => (
                      <TableRow key={request.requestId}>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.rank}</TableCell>
                        <TableCell>{request.dodId}</TableCell>
                        <TableCell>{request.currentUnit}</TableCell>
                        <TableCell>{request.requestingUnit}</TableCell>
                        <TableCell>
                          {request.pocs.map((poc) => (
                            <StyledLink
                              key={`${poc.name}-${poc.email}`}
                              target="_blank"
                              href={`https://dod.teams.microsoft.us/l/chat/0/0?users=${poc.email}`}
                              sx={{
                                mr: 2,

                                borderBottom: (theme) => `solid ${theme.palette.primary.main} 1px`,
                                '&:active, &:visited, &:hover': {
                                  borderBottom: (theme) => `solid ${theme.palette.primary.main} 1px`,
                                },
                              }}
                            >
                              <MessageIcon
                                sx={{
                                  alignSelf: 'center',
                                  height: '20px',
                                  fill: `${theme.palette.primary.main} !important`,
                                }}
                              />
                              <Typography> {poc.name} </Typography>
                            </StyledLink>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <TransferReviewDialog
        open={showTransferDialog}
        data={transferItems}
        transferType={transferType}
        handleClose={() => {
          setShowTransferDialog(false);
          setTransferItems([]);
        }}
        onSubmit={() => {
          refetchTransferRequests();
          refetchPermissionRequests();
          setShowTransferDialog(false);
          setTransferItems([]);
        }}
      />
    </Box>
  );
};

export default RequestsTab;
