import React, { useMemo, useRef, useState } from 'react';

import { Search } from '@mui/icons-material';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { PmxToggleButtonGroup } from '@components/inputs';

import { ITransferRequest, TransferObjectType } from '@store/griffin_api/auto_dsr/models/ITransferRequest';
import {
  useAdjudicateTransferRequestMutation,
  useGetTransferRequestsQuery,
} from '@store/griffin_api/auto_dsr/slices/transferRequestsApi';
import { useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices/appSettingsSlice';

/**
 * RequestsTab Component
 *
 * Displays transfer requests in two views:
 * - Requested: Requests initiated by the user or their admin units
 * - Received: Requests requiring the user's admin approval
 *
 * Features:
 * - Toggle between requested/received views
 * - Filter by equipment type (Aircraft, UAS, AGSE)
 * - Search across multiple fields
 * - Individual approve/reject actions with undo functionality
 * - Bulk approve/reject actions for multiple requests
 * - Pagination
 */
const RequestsTab: React.FC = () => {
  // Redux state
  const appUser = useAppSelector(selectAppUser);
  const theme = useTheme();

  // API queries - Fetch user's elevated roles (admin UICs)
  const { data: elevatedRoles } = useGetUserElevatedRolesQuery(appUser.userId);

  // API queries - Fetch all transfer requests user has access to (backend filters by permissions)
  const { data: transferRequests, isLoading, error } = useGetTransferRequestsQuery();

  // API mutation - Adjudicate (approve/reject) transfer requests
  const [adjudicateTransfer] = useAdjudicateTransferRequestMutation();

  // Component state
  const [requestType, setRequestType] = useState<string>('requested'); // Toggle between 'requested' and 'received'
  const [filterValue, setFilterValue] = useState<string>(''); // Search input value
  const [objectTypeFilter, setObjectTypeFilter] = useState<TransferObjectType[]>([TransferObjectType.AIRCRAFT]); // Equipment type filters
  const [page, setPage] = useState(0); // Current pagination page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [showSnackbar, setShowSnackbar] = useState(false); // Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message text
  const [selectedRequests, setSelectedRequests] = useState<ITransferRequest[]>([]); // Selected requests for bulk actions
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for undo functionality

  // Extract list of UICs user has admin rights over (for frontend validation)
  const adminUics = useMemo(() => {
    return elevatedRoles?.admin || [];
  }, [elevatedRoles]);

  /**
   * Filter transfer requests based on requested/received toggle
   *
   * Requested: Shows requests where user is the requester OR from units they manage
   * Received: Shows requests from others that involve units the user manages
   */
  const filteredByRequestType = useMemo(() => {
    if (!transferRequests) return [];

    if (requestType === 'requested') {
      // Show requests where:
      // - User is the requester (requests I personally initiated), OR
      // - Request is from a unit the user has admin rights over
      return transferRequests.filter(
        (request) => request.requestedByUser?.userId === appUser.userId || adminUics.includes(request.originatingUic),
      );
    } else {
      // Show requests where:
      // - User is NOT the requester, AND
      // - User has admin rights over either the originating OR destination unit
      // (These are requests that need my admin attention/approval)
      return transferRequests.filter(
        (request) =>
          request.requestedByUser?.userId !== appUser.userId &&
          (adminUics.includes(request.originatingUic) || adminUics.includes(request.destinationUic)),
      );
    }
  }, [transferRequests, requestType, appUser.userId, adminUics]);

  /**
   * Determine display status based on approval states
   *
   * @param request - Transfer request object
   * @returns User-friendly status string
   */
  const getDisplayStatus = (request: ITransferRequest): string => {
    // TODO: Will need to fix based on TransferLogs and not just requests

    // If both units approved, show "Approved"
    if (request.originatingUnitApproved && request.destinationUnitApproved) {
      return 'Approved';
    }

    // If status is "New" and partially approved, show "Pending"
    if (request.status === 'New' && (request.originatingUnitApproved || request.destinationUnitApproved)) {
      return 'Pending';
    }

    // If status is "New" and no approvals yet, show "Pending"
    if (request.status === 'New') {
      return 'Pending';
    }

    // Otherwise, return the actual status (Accepted, Rejected, etc.)
    return request.status;
  };

  /**
   * Apply equipment type filter and search filter, then sort by date
   */
  const filteredData = useMemo(() => {
    return (
      filteredByRequestType
        // Filter by selected equipment types (Aircraft, UAC, UAV)
        .filter((request) => objectTypeFilter.includes(request.requestedObjectType))
        // Filter by search term across multiple fields
        .filter((request) => {
          const serialNumber = request.aircraft || request.uac || request.uav || '';
          const searchLower = filterValue.toLowerCase();

          return (
            serialNumber.toLowerCase().includes(searchLower) ||
            request.originatingUic.toLowerCase().includes(searchLower) ||
            request.originatingName.toLowerCase().includes(searchLower) ||
            request.destinationUic.toLowerCase().includes(searchLower) ||
            request.destinationName.toLowerCase().includes(searchLower) ||
            request.status.toLowerCase().includes(searchLower) ||
            (request.model || '').toLowerCase().includes(searchLower) ||
            getDisplayStatus(request).toLowerCase().includes(searchLower) ||
            (request.requestedByUser?.lastName || '').toLowerCase().includes(searchLower)
          );
        })
        // Sort by date requested (newest first)
        .sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime())
    );
  }, [filteredByRequestType, filterValue, objectTypeFilter]);

  /**
   * Get paginated subset of filtered data for current page
   */
  const visibleRows = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // ========== Event Handlers ==========

  /**
   * Handle pagination page change
   * Clears selections when changing pages
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setSelectedRequests([]);
  };

  /**
   * Handle rows per page change
   * Clears selections and resets to first page
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedRequests([]);
  };

  /**
   * Toggle equipment type filter on/off
   *
   * @param value - Equipment type to toggle
   */
  const handleObjectTypeFilterClick = (value: TransferObjectType) => {
    setObjectTypeFilter((prev) => (prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]));
  };

  /**
   * Toggle selection of a single request
   *
   * @param request - Transfer request to select/deselect
   */
  const handleRequestSelect = (request: ITransferRequest) => {
    setSelectedRequests((prev) =>
      prev.some((req) => req.id === request.id) ? prev.filter((req) => req.id !== request.id) : [...prev, request],
    );
  };

  /**
   * Toggle selection of all visible requests on current page
   */
  const handleSelectAll = () => {
    if (selectedRequests.length !== visibleRows.length) {
      setSelectedRequests(visibleRows);
    } else {
      setSelectedRequests([]);
    }
  };

  /**
   * Handle approve/reject action for a single transfer request
   * Shows snackbar with undo option, then executes after 4.5 second delay
   *
   * @param request - Transfer request to adjudicate
   * @param approved - True for approve, false for reject
   */
  const handleRequestUpdate = async (request: ITransferRequest, approved: boolean) => {
    const serialNumber = getSerialNumber(request);

    // Show snackbar with action message
    setSnackbarMessage(`Transfer request for ${serialNumber} was ${approved ? 'approved' : 'rejected'}.`);
    setShowSnackbar(true);

    // Delay API call by 4.5 seconds to allow undo
    timeoutRef.current = setTimeout(async () => {
      try {
        await adjudicateTransfer({
          transfer_request_ids: [request.id],
          approved: approved,
        }).unwrap();
      } catch (error) {
        // Show error message to user via snackbar
        setSnackbarMessage(`Error: Failed to ${approved ? 'approve' : 'reject'} transfer request for ${serialNumber}.`);
        setShowSnackbar(true);
      }
    }, 4500);
  };

  /**
   * Handle bulk approve/reject action for selected requests
   * Shows snackbar with undo option, then executes after 4.5 second delay
   *
   * @param approved - True for approve, false for reject
   */
  const handleRequestBulkUpdate = (approved: boolean) => {
    const count = selectedRequests.length;
    setSnackbarMessage(`${count} transfer request${count > 1 ? 's' : ''} ${approved ? 'approved' : 'rejected'}.`);
    setShowSnackbar(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        await adjudicateTransfer({
          transfer_request_ids: selectedRequests.map((req) => req.id),
          approved: approved,
        }).unwrap();

        setSelectedRequests([]);
      } catch (error) {
        // Show error message to user via snackbar
        setSnackbarMessage(
          `Error: Failed to ${approved ? 'approve' : 'reject'} ${count} transfer request${count > 1 ? 's' : ''}.`,
        );
        setShowSnackbar(true);
      }
    }, 4500);
  };

  /**
   * Cancel pending adjudication action (undo)
   * Clears timeout and hides snackbar
   */
  const handleRequestUpdateUndo = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSnackbar(false);
  };

  // ========== Helper Functions ==========

  /**
   * Get serial number from request based on equipment type
   *
   * @param request - Transfer request object
   * @returns Serial number or em dash if not available
   */
  const getSerialNumber = (request: ITransferRequest): string => {
    return request.aircraft || request.uac || request.uav || '—';
  };

  /**
   * Get model from request
   *
   * @param request - Transfer request object
   * @returns Model or em dash if not available
   */
  const getModel = (request: ITransferRequest): string => {
    return request.model || '—';
  };

  /**
   * Format date string to MM/DD/YYYY
   *
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  /**
   * Generate appropriate message when no rows are displayed
   * Handles loading, error, and empty states
   *
   * @returns Message string to display
   */
  const getNoRowsMessage = (): string => {
    if (isLoading) return 'Loading transfer requests...';
    if (error) return 'Error loading transfer requests.';
    if (objectTypeFilter.length === 0) {
      return 'No equipment types selected. Please select at least one filter.';
    }

    // Build list of selected equipment type names
    const typeNames = objectTypeFilter.map((type) => {
      switch (type) {
        case TransferObjectType.AIRCRAFT:
          return 'Aircraft';
        case TransferObjectType.UAC:
          return 'UAC';
        case TransferObjectType.UAV:
          return 'UAV';
        default:
          return type;
      }
    });

    // Return appropriate message based on current tab
    if (requestType === 'requested') {
      return `No ${typeNames.join(', ')} transfer requests from you or your units you have admin rights to.`;
    } else {
      return `No ${typeNames.join(', ')} transfer requests requiring your admin approval.`;
    }
  };

  return (
    <Box data-testid="requests-tab-content" sx={{ width: '100%', overflow: 'hidden', padding: '5px' }}>
      {/* Snackbar for undo functionality - appears after approve/reject action */}
      <Snackbar
        data-testid={'transfer-request-undo-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{ marginTop: '75px', backgroundColor: theme.palette.layout?.background11 }}
        message={snackbarMessage}
        autoHideDuration={4000}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleRequestUpdateUndo}
            sx={{
              textTransform: 'none',
              textDecoration: 'underline',
              color: theme.palette.primary.main,
              '&&:hover': {
                textDecoration: 'underline',
                backgroundColor: 'transparent',
                color: theme.palette.mode === 'light' ? theme.palette.primary.l20 : theme.palette.primary.d20,
              },
            }}
          >
            Undo
          </Button>
        }
      />

      {/* Toggle between Requested and Received views */}
      <PmxToggleButtonGroup
        value={requestType}
        options={['requested', 'received']}
        onChange={(value) => {
          setRequestType(value as string);
          setPage(0);
          setSelectedRequests([]);
        }}
      />

      {/* Explanatory text for toggle options */}
      <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
        Requested - Transfer requests you personally initiated (or your admin units submitted)
        <br />
        Received - Transfer requests requiring your admin approval (for units you manage)
      </Typography>

      {/* Filters and Search Bar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={'space-between'}
        sx={{ my: (theme) => theme.spacing(3) }}
      >
        {/* Equipment Type Filter Chips */}
        <Box>
          Filter By:
          {/* Aircraft Filter */}
          <Chip
            variant="outlined"
            id="filter-aircraft-button"
            data-testid="filter-aircraft-button"
            label="Aircraft"
            icon={objectTypeFilter.includes(TransferObjectType.AIRCRAFT) ? <DoneIcon /> : undefined}
            onClick={() => handleObjectTypeFilterClick(TransferObjectType.AIRCRAFT)}
            sx={{
              ml: 2,
              borderRadius: 2,
              fontWeight: 500,
              color: objectTypeFilter.includes(TransferObjectType.AIRCRAFT) ? theme.palette.text.primary : undefined,
              borderColor: objectTypeFilter.includes(TransferObjectType.AIRCRAFT)
                ? theme.palette.primary.main
                : undefined,
              background: objectTypeFilter.includes(TransferObjectType.AIRCRAFT)
                ? theme.palette.mode === 'light'
                  ? `${theme.palette.primary.l60}`
                  : `${theme.palette.primary.d60}`
                : undefined,
              '&&:hover': {
                fontWeight: 400,
                borderColor: theme.palette.text.disabled,
                background: objectTypeFilter.includes(TransferObjectType.AIRCRAFT)
                  ? theme.palette.mode === 'light'
                    ? `${theme.palette.primary.l60}`
                    : `${theme.palette.primary.d60}`
                  : undefined,
              },
              '& .MuiChip-icon': {
                color: theme.palette.text.primary,
              },
            }}
          />
          {/* UAS Filter (combines UAC and UAV) */}
          <Chip
            variant="outlined"
            id="filter-uas-button"
            data-testid="filter-uas-button"
            label="UAS"
            icon={
              objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV) ? (
                <DoneIcon />
              ) : undefined
            }
            onClick={() => {
              const hasUAS =
                objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV);
              if (hasUAS) {
                // Remove both UAC and UAV
                setObjectTypeFilter((prev) =>
                  prev.filter((type) => type !== TransferObjectType.UAC && type !== TransferObjectType.UAV),
                );
              } else {
                // Add both UAC and UAV
                setObjectTypeFilter((prev) => [...prev, TransferObjectType.UAC, TransferObjectType.UAV]);
              }
            }}
            sx={{
              ml: 2,
              borderRadius: 2,
              fontWeight: 500,
              color:
                objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV)
                  ? theme.palette.text.primary
                  : undefined,
              borderColor:
                objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV)
                  ? theme.palette.primary.main
                  : undefined,
              background:
                objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV)
                  ? theme.palette.mode === 'light'
                    ? `${theme.palette.primary.l60}`
                    : `${theme.palette.primary.d60}`
                  : undefined,
              '&&:hover': {
                fontWeight: 400,
                borderColor: theme.palette.text.disabled,
                background:
                  objectTypeFilter.includes(TransferObjectType.UAC) || objectTypeFilter.includes(TransferObjectType.UAV)
                    ? theme.palette.mode === 'light'
                      ? `${theme.palette.primary.l60}`
                      : `${theme.palette.primary.d60}`
                    : undefined,
              },
              '& .MuiChip-icon': {
                color: theme.palette.text.primary,
              },
            }}
          />
          {/* AGSE Filter (disabled - not yet implemented) */}
          <Chip
            variant="outlined"
            id="filter-agse-button"
            data-testid="filter-agse-button"
            label="AGSE"
            disabled
            sx={{ ml: 2, borderRadius: 2, fontWeight: 500 }}
          />
        </Box>

        {/* Right side: Bulk Actions and Search */}
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Bulk Action Buttons - Only show on "received" tab */}
          {requestType === 'received' && (
            <>
              <Button
                variant="contained"
                startIcon={<Check />}
                onClick={() => handleRequestBulkUpdate(true)}
                disabled={selectedRequests.length === 0}
                sx={{
                  '&&:disabled': {
                    color: theme.palette.text.contrastText,
                    background:
                      theme.palette.mode === 'light' ? `${theme.palette.primary.l40}` : `${theme.palette.primary.d40}`,
                  },
                }}
              >
                ACCEPT
              </Button>
              <Button
                variant="outlined"
                startIcon={<Close />}
                color="error"
                onClick={() => handleRequestBulkUpdate(false)}
                disabled={selectedRequests.length === 0}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  color: theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
                  borderColor:
                    theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
                  '&&:disabled': {
                    color: theme.palette.mode === 'light' ? `${theme.palette.error.l40}` : `${theme.palette.error.d40}`,
                    borderColor:
                      theme.palette.mode === 'light' ? `${theme.palette.error.l40}` : `${theme.palette.error.d40}`,
                  },
                  '&&:hover': {
                    color: theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
                    borderColor:
                      theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
                  },
                }}
              >
                REJECT
              </Button>
            </>
          )}

          {/* Search Input */}
          <TextField
            variant="standard"
            name="Search"
            placeholder={'Search requests'}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            sx={{ p: 1, width: '250px' }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: { p: 1, borderRadius: '10px', backgroundColor: theme.palette.layout?.background11 },
            }}
          />
        </Stack>
      </Stack>

      {/* Transfer Requests Table */}
      <TableContainer data-testid="transfer-requests-table" sx={{ maxHeight: '50vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{ '& th': { backgroundColor: (theme) => `${theme.palette.layout.background14} !important` } }}
            >
              {/* Checkbox column - only show on "received" tab */}
              {requestType === 'received' && (
                <TableCell sx={{ width: '4%' }}>
                  <Checkbox
                    checked={visibleRows.length > 0 && selectedRequests.length === visibleRows.length}
                    indeterminate={selectedRequests.length > 0 && selectedRequests.length < visibleRows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell sx={{ width: requestType === 'received' ? '9%' : '10%', whiteSpace: 'nowrap' }}>
                Serial Number
              </TableCell>
              <TableCell sx={{ width: requestType === 'received' ? '7%' : '8%' }}>Model</TableCell>
              <TableCell sx={{ width: '18%' }}>Losing Unit</TableCell>
              <TableCell sx={{ width: '18%' }}>Gaining Unit</TableCell>
              <TableCell sx={{ width: '10%' }}>Status</TableCell>
              <TableCell sx={{ width: '10%' }}>Requested Date</TableCell>
              <TableCell sx={{ width: requestType === 'received' ? '15%' : '20%' }}>POC</TableCell>
              {/* Actions column only shows on "received" tab */}
              {requestType === 'received' && <TableCell sx={{ width: '10%' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length > 0 ? (
              // Render table rows for each visible request
              visibleRows.map((request) => (
                <TableRow key={request.id} data-testid={`request-${request.id}-table-row`}>
                  {/* Checkbox column - only show on "received" tab */}
                  {requestType === 'received' && (
                    <TableCell>
                      <Checkbox
                        inputProps={{ 'aria-label': 'select-request-checkbox' }}
                        checked={selectedRequests.some((req) => req.id === request.id)}
                        onChange={() => handleRequestSelect(request)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{getSerialNumber(request)}</TableCell>
                  <TableCell>{getModel(request)}</TableCell>
                  <TableCell>{request.originatingName}</TableCell>
                  <TableCell>{request.destinationName}</TableCell>
                  <TableCell>{getDisplayStatus(request)}</TableCell>
                  <TableCell>{formatDate(request.dateRequested)}</TableCell>
                  <TableCell>
                    {request.requestedByUser?.rank} {request.requestedByUser?.firstName}{' '}
                    {request.requestedByUser?.lastName}
                  </TableCell>
                  {/* Approve/Reject buttons only show on "received" tab */}
                  {requestType === 'received' && (
                    <TableCell>
                      <IconButton
                        aria-label="approve-button"
                        onClick={() => handleRequestUpdate(request, true)}
                        size="small"
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        aria-label="reject-button"
                        onClick={() => handleRequestUpdate(request, false)}
                        size="small"
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              // Empty state row when no data to display
              <TableRow data-testid={'no-requests-table-row'}>
                <TableCell
                  colSpan={requestType === 'received' ? 9 : 7} // Add 1 for checkbox, 1 for actions on received tab
                  sx={{
                    width: '100%',
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? theme.palette.layout.background5
                        : theme.palette.layout.background7,
                  }}
                >
                  {getNoRowsMessage()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default RequestsTab;
