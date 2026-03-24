import { useMemo, useState } from 'react';

import { Search } from '@mui/icons-material';
import DoneIcon from '@mui/icons-material/Done';
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
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

import { IUserRole, UserRoleOptions } from '@store/griffin_api/users/models/IUserRole';
import { useGetRolesQuery, useUpdateRoleMutation } from '@store/griffin_api/users/slices/userRoleApi';

import CreateNewUserModal from './CreateNewUserModal';

/* UI Components */
const UserPermissionsTab: React.FC = () => {
  // State Declaration Variables
  const { data: userRoleData, isLoading, isFetching } = useGetRolesQuery(undefined);
  const [userRoleUpdate] = useUpdateRoleMutation();
  const [filterValue, setFilterValue] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRoleOptions[]>(Object.values(UserRoleOptions));

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();

  // Use Memos
  const filteredData = useMemo(() => {
    if (!userRoleData) {
      return [];
    } else {
      return userRoleData
        .filter(
          (userRole) =>
            userRole.user.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
            userRole.user.lastName.toLowerCase().includes(filterValue.toLowerCase()) ||
            userRole.user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
            userRole.user.userId.toLowerCase().includes(filterValue.toLowerCase()) ||
            userRole.unit.uic.toLowerCase().includes(filterValue.toLowerCase()) ||
            userRole.unit.displayName.toLowerCase().includes(filterValue.toLowerCase()),
        )
        .filter((userRole) => roleFilter.includes(userRole.accessLevel))
        .sort((a, b) => a.user.lastName.localeCompare(b.user.lastName));
    }
  }, [userRoleData, filterValue, roleFilter]);

  const visibleRows = useMemo(() => {
    return filteredData ? [...filteredData].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];
  }, [filteredData, page, rowsPerPage]);

  // Handler Functions
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleFilterClick = (value: UserRoleOptions) => {
    setRoleFilter((prev) => (prev.includes(value) ? prev.filter((role) => role !== value) : [...prev, value]));
  };

  const handleRoleChange = async (e: SelectChangeEvent, role: IUserRole) => {
    const updatedRole = {
      ...role,
      accessLevel: e.target.value as UserRoleOptions,
    };

    if (role.accessLevel === updatedRole.accessLevel) return;

    try {
      const response = await userRoleUpdate({ updatedRole: updatedRole });

      if (response && !response.error) {
        setSnackbarMessage(
          `${role.user.rank} ${role.user.lastName}'s ${role.accessLevel.toLowerCase()} role was updated to ${updatedRole.accessLevel.toLowerCase()}.`,
        );
      } else {
        setSnackbarMessage('An error occurred.');
      }
    } catch (err) {
      setSnackbarMessage('An error occurred.');
    }

    setShowSnackbar(true);
  };

  const getNoRowsMessage = (): string => {
    if (roleFilter.length === 0) {
      return 'There are no roles to display.';
    }

    const roleNames = roleFilter.map((role) => `${role.toLowerCase()}`);

    if (roleFilter.length === 1) {
      return `No users with ${roleNames[0]} permissions in this unit.`;
    } else if (roleFilter.length === 2) {
      return `No users with ${roleNames[0]} or ${roleNames[1]} permissions in this unit.`;
    } else {
      const lastRole = roleNames.pop();
      return `No users with ${roleNames.join(', ')} or ${lastRole} permissions in this unit.`;
    }
  };

  return (
    <Box data-testid="user-permissions-tab-content" sx={{ width: '100%', overflow: 'hidden' }}>
      <CreateNewUserModal setSnackbarMessage={setSnackbarMessage} setShowSnackbar={setShowSnackbar} />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={'space-between'}
        sx={{ my: (theme) => theme.spacing(3) }}
      >
        <Box>
          Filter By:
          {Object.values(UserRoleOptions).map((value) => (
            <Chip
              key={value}
              variant="outlined"
              id={`filter-${value}-buttion`}
              data-testid={`filter-${value}-buttion`}
              label={`${value}`}
              icon={roleFilter.includes(value) ? <DoneIcon /> : undefined}
              onClick={() => handleRoleFilterClick(value)}
              sx={{
                ml: 2,
                borderRadius: 2,
                fontWeight: 500,
                color: roleFilter.includes(value) ? theme.palette.text.primary : undefined,
                borderColor: roleFilter.includes(value) ? theme.palette.primary.main : undefined,
                background: roleFilter.includes(value)
                  ? theme.palette.mode === 'light'
                    ? `${theme.palette.primary.l60}`
                    : `${theme.palette.primary.d60}`
                  : undefined,
                '&&:hover': {
                  fontWeight: 400,
                  borderColor: theme.palette.text.disabled,
                  background: roleFilter.includes(value)
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
          ))}
        </Box>
        <TextField
          variant="standard"
          name="Search"
          placeholder={'Search users'}
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
      <TableContainer data-testid="user-permissions-table" sx={{ maxHeight: '50vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{ '& th': { backgroundColor: (theme) => `${theme.palette.layout.background14} !important` } }}
            >
              <TableCell sx={{ width: '16%' }}>Name</TableCell>
              <TableCell sx={{ width: '16%' }}>Rank</TableCell>
              <TableCell sx={{ width: '16%' }}>DoD ID Number</TableCell>
              <TableCell sx={{ width: '16%' }}>Unit</TableCell>
              <TableCell sx={{ width: '16%' }}>Last Active</TableCell>
              <TableCell sx={{ width: '16%' }}>Role</TableCell>
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
              visibleRows.map((role) => (
                <TableRow key={role.id} datatest-id={`role-${role.id}-user-perm-table-row`}>
                  <TableCell>
                    {role.user.firstName} {role.user.lastName}
                  </TableCell>
                  <TableCell>{role.user.rank}</TableCell>
                  <TableCell>{role.user.userId}</TableCell>
                  <TableCell>{role.unit.uic}</TableCell>
                  <TableCell>{role.user.lastActive ?? '—'}</TableCell>
                  <TableCell>
                    <FormControl variant="standard" fullWidth>
                      <Select
                        id={`select-role-${role.id}`}
                        data-testid={`select-role-${role.id}`}
                        value={role.accessLevel}
                        onChange={(e) => handleRoleChange(e, role)}
                      >
                        {Object.values(UserRoleOptions).map((value) => (
                          <MenuItem key={value} value={value} data-testid={`select-role-${role.id}-${value}`}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Snackbar
        data-testid={'permission-request-undo-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{ marginTop: '75px', backgroundColor: theme.palette.layout?.background11 }}
        message={snackbarMessage}
        autoHideDuration={4000}
      />
    </Box>
  );
};

export default UserPermissionsTab;
