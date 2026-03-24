import { useMemo, useRef, useState } from 'react';

import { Close, Search } from '@mui/icons-material';
import Check from '@mui/icons-material/Check';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Skeleton,
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
  useTheme,
} from '@mui/material';

import { IAdminRoleRequest, RoleRequestStatus } from '@store/griffin_api/users/models/IAdminRoleRequest';
import {
  useAdjudicateRoleRequestForAdminMutation,
  useGetAllRoleRequestsForAdminQuery,
} from '@store/griffin_api/users/slices/adminRoleRequestApi';

/* UI Components */
const PermissionRequestsTab: React.FC = () => {
  // State Declaration Variables
  const { data: roleRequestData, isLoading, isFetching } = useGetAllRoleRequestsForAdminQuery(undefined);
  const [adjudicate] = useAdjudicateRoleRequestForAdminMutation();
  const [selectedRequests, setSelectedRequests] = useState<IAdminRoleRequest[]>([]);
  const [filterValue, setFilterValue] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constant Variables
  const theme = useTheme();

  // Use Memos
  const filteredData = useMemo(() => {
    if (!roleRequestData) {
      return [];
    } else {
      return roleRequestData
        .filter(
          (request) =>
            request.user.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
            request.user.lastName.toLowerCase().includes(filterValue.toLowerCase()) ||
            request.user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
            request.user.userId.toLowerCase().includes(filterValue.toLowerCase()) ||
            request.unit.uic.toLowerCase().includes(filterValue.toLowerCase()) ||
            request.unit.displayName.toLowerCase().includes(filterValue.toLowerCase()),
        )
        .sort((a, b) => a.user.lastName.localeCompare(b.user.lastName));
    }
  }, [roleRequestData, filterValue]);

  const visibleRows = useMemo(() => {
    return filteredData ? [...filteredData].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];
  }, [filteredData, page, rowsPerPage]);

  // Handler Functions
  const handleRequestSelect = (request: IAdminRoleRequest) => {
    setSelectedRequests((prev) =>
      prev.some((req) => req.id === request.id) ? prev.filter((req) => req.id !== request.id) : [...prev, request],
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length !== visibleRows.length) {
      setSelectedRequests(visibleRows);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleRequestUpdate = (request: IAdminRoleRequest, status: RoleRequestStatus) => {
    setSnackbarMessage(
      `${request.user.rank} ${request.user.lastName}'s ${request.requestedRole.toLowerCase()} request was ${status === RoleRequestStatus.APPROVE ? 'approved' : 'rejected'}.`,
    );
    setShowSnackbar(true);
    timeoutRef.current = setTimeout(async () => {
      await adjudicate({ updatedRequest: request, status: status });
    }, 4500);
    setSelectedRequests((prev) => prev.filter((r) => r.id !== request.id));
  };

  const handleRequestBulkUpdate = (status: RoleRequestStatus) => {
    setSnackbarMessage(
      `${selectedRequests.length} user permission requests were ${status === RoleRequestStatus.APPROVE ? 'approved' : 'rejected'}.`,
    );
    setShowSnackbar(true);
    timeoutRef.current = setTimeout(() => {
      selectedRequests.forEach(async (request) => {
        await adjudicate({ updatedRequest: request, status: status });
      });
    }, 4500);
    setSelectedRequests([]);
  };

  const handleRequestUpdateUndo = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSnackbar(false);
  };

  // Pagination Handler Functions
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setSelectedRequests([]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedRequests([]);
  };

  return (
    <Box data-testid="permission-requests-tab-content" sx={{ width: '100%', overflow: 'hidden' }}>
      <Snackbar
        data-testid={'permission-request-undo-snackbar'}
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={'space-between'}
        sx={{ my: (theme) => theme.spacing(3) }}
      >
        <Box>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={() => handleRequestBulkUpdate(RoleRequestStatus.APPROVE)}
            disabled={selectedRequests.length === 0}
            sx={{
              mr: 3,
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
            onClick={() => handleRequestBulkUpdate(RoleRequestStatus.DENY)}
            disabled={selectedRequests.length === 0}
            sx={{
              ml: 2,
              borderRadius: 2,
              fontWeight: 500,
              color: theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
              borderColor: theme.palette.mode === 'light' ? `${theme.palette.error.l20}` : `${theme.palette.error.d20}`,
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
        </Box>
        <TextField
          variant="standard"
          name="Search"
          placeholder={'Search Users...'}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          sx={{ p: 1, width: '33%' }}
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
      <TableContainer data-testid="permission-requests-table" sx={{ maxHeight: '50vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{ '& th': { backgroundColor: (theme) => `${theme.palette.layout.background14} !important` } }}
            >
              <TableCell sx={{ width: '6%' }}>
                <Checkbox
                  checked={
                    roleRequestData &&
                    selectedRequests.length > 0 &&
                    selectedRequests.length === roleRequestData?.length
                  }
                  indeterminate={
                    roleRequestData && selectedRequests.length > 0 && selectedRequests.length < roleRequestData?.length
                  }
                  onChange={() => handleSelectAll()}
                />
              </TableCell>
              <TableCell sx={{ width: '12.5%' }}>Name</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Rank</TableCell>
              <TableCell sx={{ width: '12.5%' }}>DoD ID Number</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Unit</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Last Active</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Current Role</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Requested Role</TableCell>
              <TableCell sx={{ width: '12.5%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || isFetching ? (
              // Add loading rows if API call is still fetching
              [...Array(rowsPerPage)].map((_, index) => (
                <TableRow key={`skeleton-row-${index}`}>
                  <TableCell
                    key={`skeleton-cell-${index}`}
                    colSpan={9}
                    sx={{
                      width: '100%',
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? theme.palette.layout.background5
                          : theme.palette.layout.background7,
                    }}
                  >
                    <Skeleton variant="rectangular" height={40} animation="wave" />
                  </TableCell>
                </TableRow>
              ))
            ) : // Display data if API call is finished
            visibleRows.length > 0 ? (
              visibleRows.map((request) => (
                <TableRow key={request.id} datatest-id={`request-${request.id}-perm-request-table-row`}>
                  <TableCell>
                    <Checkbox
                      inputProps={{ 'aria-label': 'update-checkbox' }}
                      checked={selectedRequests.some((req) => req.id === request.id)}
                      onChange={() => handleRequestSelect(request)}
                    />
                  </TableCell>
                  <TableCell>
                    {request.user.firstName} {request.user.lastName}
                  </TableCell>
                  <TableCell>{request.user.rank}</TableCell>
                  <TableCell>{request.user.userId}</TableCell>
                  <TableCell>{request.unit.uic}</TableCell>
                  <TableCell>{request.user.lastActive ?? '—'}</TableCell>
                  <TableCell>{request.currentRole}</TableCell>
                  <TableCell>{request.requestedRole}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="approve-button"
                      onClick={() => handleRequestUpdate(request, RoleRequestStatus.APPROVE)}
                    >
                      <Check />
                    </IconButton>
                    <IconButton
                      aria-label="reject-button"
                      onClick={() => handleRequestUpdate(request, RoleRequestStatus.DENY)}
                    >
                      <Close />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow datatest-id={'no-requests-perm-request-table-row'}>
                <TableCell
                  colSpan={9}
                  sx={{
                    width: '100%',
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? `${theme.palette.layout.background5}`
                        : `${theme.palette.layout.background7}`,
                  }}
                >
                  No pending user requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

export default PermissionRequestsTab;
