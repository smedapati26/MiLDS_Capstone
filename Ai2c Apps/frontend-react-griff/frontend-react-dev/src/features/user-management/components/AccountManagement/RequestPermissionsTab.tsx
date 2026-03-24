import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Delete, Info, Message } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Popover,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { UnitSelect } from '@components/dropdowns/UnitSelect';
import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { IRoleRequest, IRoleRequestOut } from '@store/griffin_api/users/models/IRoleRequest';
import { IUserBrief } from '@store/griffin_api/users/models/IUserBrief';
import {
  useCreateRoleRequestMutation,
  useDeleteRoleRequestMutation,
} from '@store/griffin_api/users/slices/roleRequestApi';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

import { UserRoleOptions } from '../../../../store/griffin_api/users/models/IUserRole';

/* Styled Link */
const StyledLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:active, &:visited, &:hover': {
    color: theme.palette.primary.main,
  },
}));

/* Props for the RequestPermissionsSection component. */
export interface RequestPermissionsProps {
  activeTab: number;
  index: number;
  roleRequestData: IRoleRequest[];
}

/* ***************************
Request Permissions Tab Component
*************************** */
const RequestPermissionsTab: FC<RequestPermissionsProps> = ({ activeTab, index, roleRequestData }) => {
  /* ***************************
    State Variable Declaration
    *************************** */
  const appUser = useAppSelector(selectAppUser);
  const { data: units, isSuccess: isUnitsSuccess } = useGetUnitsQuery({});
  const [createRoleRequest] = useCreateRoleRequestMutation();
  const [deleteRoleRequest] = useDeleteRoleRequestMutation();

  const [newRequest, setNewRequest] = useState<IRoleRequestOut>({
    user_id: appUser.userId,
    uic: '',
    access_level: UserRoleOptions.READ,
  });
  const [errors, setErrors] = useState({
    user: false,
    unit: true,
    role: true,
  });

  const [approversPopoverRequest, setApproversPopoverRequest] = useState<IRoleRequest | null>(null);
  const [approversAnchorEl, setApproversAnchorEl] = useState<HTMLTableCellElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [snackbarType, setSnackbarType] = useState<'sent' | 'deleted'>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const theme = useTheme();
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  /* ***************************
    Use Effect and Use Memo
    *************************** */
  useEffect(() => {
    setErrors({
      user: newRequest.user_id === '',
      unit: newRequest.uic === '',
      role: newRequest.access_level === UserRoleOptions.READ,
    });
  }, [newRequest]);

  const visibleRows = useMemo(
    () => (roleRequestData ? [...roleRequestData].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []),
    [roleRequestData, page, rowsPerPage],
  );

  /* ***************************
    Handle Functions
    *************************** */
  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRequestUnit = (selection: IUnitBrief) => {
    setNewRequest((prevState: IRoleRequestOut) => ({
      ...prevState,
      uic: selection.uic,
    }));
  };

  const handleChangeRequestRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRequest((prevState) => ({
      ...prevState,
      access_level: event.target.value as UserRoleOptions,
    }));
  };

  const handleSubmitRequest = async () => {
    const response = await createRoleRequest(newRequest);

    if ('data' in response) {
      setSnackbarType('sent');
      setShowSnackbar(true);

      setNewRequest({
        user_id: appUser.userId,
        uic: '',
        access_level: UserRoleOptions.READ,
      });
    }
  };

  const handleDeleteRequest = (request: IRoleRequest) => {
    setSnackbarType('deleted');
    setShowSnackbar(true);
    timeoutRef.current = setTimeout(async () => {
      await deleteRoleRequest({ request });
    }, 4500);
  };

  const handleRequestDeleteUndo = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSnackbar(false);
  };

  const handleApproversClick = (event: React.MouseEvent<HTMLTableCellElement>, request: IRoleRequest) => {
    if (request.approvers.length > 0) {
      setApproversPopoverRequest(request);
      setApproversAnchorEl(event.currentTarget);
    }
  };

  const handleApproversClose = () => {
    setApproversPopoverRequest(null);
    setApproversAnchorEl(null);
  };

  /* Approvers Link UI */
  const renderApprovers = (approvers: IUserBrief[]) => {
    const maxChars = 30;
    let currentTotal = 0;
    const result: JSX.Element[] = [];

    approvers.map((approver: IUserBrief, index: number) => {
      const remaining = maxChars - currentTotal;

      if (remaining > 0) {
        let displayText = `${approver.rank} ${approver.firstName} ${approver.lastName}`;
        if (displayText.length > remaining) {
          displayText = displayText.slice(0, remaining).concat('...');
        }

        currentTotal += displayText.length;
        result.push(
          <StyledLink
            key={`${approver.userId}-${index}`}
            target="_blank"
            href={`https://dod.teams.microsoft.us/l/chat/0/0?users=${approver.email}`}
            sx={{
              mr: 2,

              borderBottom: `solid ${theme.palette.primary.main} 1px`,
              '&:active, &:visited, &:hover': {
                borderBottom: `solid ${theme.palette.primary.main} 1px`,
              },
            }}
          >
            <Message sx={{ alignSelf: 'center', height: '20px' }} />
            <Typography> {displayText} </Typography>
          </StyledLink>,
        );
      }
    });

    return result;
  };
  /* Request Permissions Tab UI */
  return (
    <Box role="tabpanel" hidden={activeTab !== index} aria-label="Request Permissions">
      {activeTab === index && (
        <Box sx={{ m: 2 }} aria-label="Request Permissions Tab Content">
          <Card
            sx={{
              width: '50%',
              p: 4,
              mb: 4,
              '&:hover': {
                borderColor:
                  theme.palette.mode === 'dark' ? theme.palette.layout.background16 : theme.palette.layout.background11,
              },
            }}
          >
            <Stack direction="row" alignItems="normal" justifyContent="space-between">
              <Typography>Request elevated permissions for a unit.</Typography>
              <Button
                aria-label="Submit Request Button"
                variant="outlined"
                onClick={handleSubmitRequest}
                disabled={Object.values(errors).some((value) => value === true)}
              >
                REQUEST
              </Button>
            </Stack>
            <Grid container direction="row" justifyContent={'space-between'} spacing={1}>
              <Grid item xs={7}>
                <FormControl fullWidth required sx={{ my: 4 }}>
                  <UnitSelect
                    units={isUnitsSuccess ? mapUnitsWithTaskforceHierarchy(units) : []}
                    onChange={handleChangeRequestUnit}
                    value={units?.find((unit: IUnitBrief) => unit.uic === newRequest.uic) || undefined}
                    label="Unit"
                    id="requested-unit"
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant={'body2'}>Role *</Typography>
                    <Tooltip
                      placement={'bottom-start'}
                      title={
                        <div>
                          Writers can edit data within their unit.
                          <br />
                          <br />
                          Administrators can edit data within their unit, manage permissions, and create Task Forces.
                        </div>
                      }
                    >
                      <IconButton>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <RadioGroup
                    value={newRequest.access_level}
                    onChange={handleChangeRequestRole}
                    aria-label="Role Radio Buttons"
                    aria-labelledby="RoleRadioLabel"
                    sx={{ ml: 1, mt: 1 }}
                  >
                    <FormControlLabel
                      key={UserRoleOptions.WRITE}
                      value={UserRoleOptions.WRITE}
                      control={<Radio aria-label={UserRoleOptions.WRITE + ' - Radio Option'} size="small" />}
                      label={UserRoleOptions.WRITE}
                    />
                    <FormControlLabel
                      key={UserRoleOptions.ADMIN}
                      value={UserRoleOptions.ADMIN}
                      control={<Radio aria-label={UserRoleOptions.ADMIN + ' - Radio Option'} size="small" />}
                      label={UserRoleOptions.ADMIN}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Card>

          <TableContainer sx={{ mb: 5 }}>
            <Table aria-label="Requested Permissions Table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1, width: '20%' }}>Unit</TableCell>
                  <TableCell sx={{ py: 1, width: '20%' }}>Permissions</TableCell>
                  <TableCell sx={{ py: 1, width: '20%' }}>Date Requested</TableCell>
                  <TableCell sx={{ py: 1, width: '35%' }}>Approver(s)</TableCell>
                  <TableCell sx={{ py: 1, width: '5%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.length > 0 ? (
                  visibleRows.map((request) => (
                    <TableRow key={index}>
                      <TableCell sx={{ py: 2 }}>{request.unit.displayName}</TableCell>
                      <TableCell sx={{ py: 2 }}>{request.requestedRole}</TableCell>
                      <TableCell sx={{ py: 2 }}>{request.dateRequested}</TableCell>
                      <TableCell onClick={(e) => handleApproversClick(e, request)} sx={{ py: 0, cursor: 'pointer' }}>
                        {renderApprovers(request.approvers)}
                      </TableCell>
                      <TableCell sx={{ py: 0 }}>
                        <IconButton
                          onClick={() => handleDeleteRequest(request)}
                          data-testid={`delete-button-${request.id}`}
                        >
                          <Delete />
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
                      No pending requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[]}
                    count={roleRequestData.length}
                    rowsPerPage={5}
                    page={page}
                    onPageChange={handleChangePage}
                  />
                </TableRow>
              </TableFooter>
            </Table>

            <Popover
              id={'approvers-popover'}
              open={Boolean(approversPopoverRequest) && Boolean(approversAnchorEl)}
              anchorEl={approversAnchorEl}
              onClose={() => handleApproversClose()}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {approversPopoverRequest?.approvers.map((approver: IUserBrief, index: number) => (
                <Stack direction="row" key={`${approver.userId}-${index}-expanded`} spacing={2} sx={{ m: 2 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      borderBottom: `solid ${theme.palette.primary.main} 1px`,
                      gap: 1,
                    }}
                  >
                    <StyledLink
                      key={`${approver.userId}-${index}-teams`}
                      target="_blank"
                      href={`https://dod.teams.microsoft.us/l/chat/0/0?users=${approver.email}`}
                    >
                      <Message sx={{ alignSelf: 'center', height: '20px' }} />
                      <Typography>{`${approver.rank} ${approver.firstName} ${approver.lastName}`}</Typography>
                    </StyledLink>
                    {approver.email && (
                      <StyledLink
                        key={`${approver.userId}-${index}-email`}
                        target="_blank"
                        href={`mailto:${approver.email}`}
                      >
                        {`(${approver.email})`}
                      </StyledLink>
                    )}
                  </Box>
                </Stack>
              ))}
            </Popover>
          </TableContainer>
          <Snackbar
            data-testid={'role-request-snackbar'}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={showSnackbar}
            onClose={() => setShowSnackbar(false)}
            sx={{ marginTop: '75px', backgroundColor: theme.palette.layout.background11 }}
            message={snackbarType === 'sent' ? 'Request sent.' : 'Request deleted.'}
            autoHideDuration={4000}
            action={
              snackbarType === 'deleted' && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRequestDeleteUndo}
                  sx={{
                    textTransform: 'none',
                    textDecoration: 'underline',
                    color: theme.palette.primary.main,
                    '&&:hover': {
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      color: theme.palette.mode === 'dark' ? theme.palette.primary.d20 : theme.palette.primary.l20,
                    },
                  }}
                >
                  Undo
                </Button>
              )
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default RequestPermissionsTab;
