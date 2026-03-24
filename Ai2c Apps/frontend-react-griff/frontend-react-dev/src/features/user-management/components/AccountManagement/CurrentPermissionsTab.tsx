import { FC, useMemo, useState } from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from '@mui/material';

import { useGetRolesByUserIdQuery } from '@store/griffin_api/users/slices/userRoleApi';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

/* Props for the CurrentPermissionsSection component. */
export interface CurrentPermissionsProps {
  activeTab: number;
  index: number;
}

/* ***************************
Current Permissions Tab Component
*************************** */
const CurrentPermissionsTab: FC<CurrentPermissionsProps> = ({ activeTab, index }) => {
  /* ***************************
    State Variable Declaration
    *************************** */
  const appUser = useAppSelector(selectAppUser);
  const { data: userRoleData } = useGetRolesByUserIdQuery({ userId: appUser.userId });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();

  /* ***************************
    Handle Functions
    *************************** */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(
    () => (userRoleData ? [...userRoleData].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []),
    [userRoleData, page, rowsPerPage],
  );

  return (
    <Box role="tabpanel" hidden={activeTab !== index} aria-label="View Permissions">
      {activeTab === index && (
        <Box sx={{ m: 2 }} aria-label="View Permissions Tab Content">
          <TableContainer sx={{ mb: 5 }}>
            <Table aria-label="Current Permissions Table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1, width: '33%' }}>Unit</TableCell>
                  <TableCell sx={{ py: 1, width: '33%' }}>Permissions</TableCell>
                  <TableCell sx={{ py: 1, width: '33%' }}>Date Granted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.length > 0 ? (
                  visibleRows.map((role) => (
                    <TableRow key={role.unit.uic}>
                      <TableCell sx={{ py: 2 }}>{role.unit.displayName}</TableCell>
                      <TableCell sx={{ py: 2 }}>{role.accessLevel}</TableCell>
                      <TableCell sx={{ py: 2 }}>{role.grantedOn}</TableCell>
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
                      No admin or write permissions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    count={userRoleData?.length ?? 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CurrentPermissionsTab;
