/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useUnitAccess from '@hooks/useUnitAccess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import {
  AlertColor,
  Autocomplete,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { CenterItem, PmxTimeline } from '@components/index';
import PmxAlert from '@components/PmxAlert';
import { IMaintainer, setEventType, setMaintainer, setUpdateAvailability } from '@features/amtp-packet/slices';
import { ISoldier, useLazyGetUnitSoldiersQuery } from '@store/amap_ai/soldier';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { StatusType } from '@utils/constants';
import { determineEvaluationStatus } from '@utils/helpers/dataTransformer';

import PFCIcon from '../../../../assets/ranks/PFC.svg';
import PV2Icon from '../../../../assets/ranks/PV2.svg';
import SFCIcon from '../../../../assets/ranks/SFC.svg';
import SGTIcon from '../../../../assets/ranks/SGT.svg';
import SPCIcon from '../../../../assets/ranks/SPC.svg';
import SSGIcon from '../../../../assets/ranks/SSG.svg';
import SoldierEditDialog from './SoldierEditDialog';
import StatusDisplay from './StatusDisplay';

const SoldierInformation = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { hasRole } = useUnitAccess();
  const { currentUic, currentUnit } = useAppSelector((state) => state.appSettings);
  const { maintainer, updateAvailability } = useAppSelector((state) => state.amtpPacket);
  const [getSoldier, queryResult] = useLazyGetUserQuery({});
  const { data: currentSoldier } = queryResult || {};
  const [getUnitSoldiers, { data, isLoading: soldiersLoading }] = useLazyGetUnitSoldiersQuery();
  const soldiers = data?.soldiers ?? [];

  const [editOpen, setEditOpen] = useState<boolean>(false);

  const showAdditionalMOS = () => {
    const primary = currentSoldier?.primaryMos;
    const keys = Object.keys(currentSoldier?.allMosAndMl || {}).filter((x) => x !== primary);
    const firstKey = keys[0];
    const remainingMOS = keys.filter((x) => x !== firstKey);
    const remainingCount = remainingMOS.length;

    return (
      <>
        {firstKey && (
          <Typography variant="body1" ml={3}>
            {`${firstKey} - ${currentSoldier?.allMosAndMl?.[firstKey] || 'n/a'}`}
          </Typography>
        )}
        {remainingCount > 0 && (
          <Tooltip title={remainingMOS.join(', ')}>
            <Typography variant="body1" ml={3}>
              {`+${remainingCount} more`}
            </Typography>
          </Tooltip>
        )}
      </>
    );
  };

  useEffect(() => {
    if (!currentUic) return;
    dispatch(setMaintainer(null));

    getUnitSoldiers({ uic: currentUic, type: 'all_maintainers' });
  }, [currentUic, getUnitSoldiers]);

  useEffect(() => {
    if (!currentUic) return;
    if (!soldiers || soldiers.length === 0) return;

    const firstSoldier = soldiers[0];
    const selectedSoldier: IMaintainer = {
      id: firstSoldier.userId,
      name: `${firstSoldier.rank} ${firstSoldier.firstName} ${firstSoldier.lastName}`,
      pv2Dor: firstSoldier.pv2Dor as string,
      pfcDor: firstSoldier.pfcDor as string,
      sfcDor: firstSoldier.sfcDor as string,
      sgtDor: firstSoldier.sgtDor as string,
      spcDor: firstSoldier.spcDor as string,
      ssgDor: firstSoldier.ssgDor as string,
      primaryMos: firstSoldier.primaryMos as string,
      mos: firstSoldier.allMosAndMl ? Object.keys(firstSoldier.allMosAndMl) : null,
      ml: currentSoldier?.allMosAndMl
        ? Object.values(currentSoldier.allMosAndMl).filter((v): v is string => typeof v === 'string')
        : null,
    };

    dispatch(setMaintainer(selectedSoldier));
  }, [soldiers, currentUic]);

  useEffect(() => {
    if (maintainer?.id && updateAvailability) {
      getSoldier({ userId: maintainer.id }).then(() => {
        dispatch(setUpdateAvailability(false));
      });
      return;
    }
    if (maintainer?.id) {
      getSoldier({ userId: maintainer.id });
    }
  }, [maintainer, updateAvailability]);

  const evaluation = (() => {
    if (!currentSoldier?.birthMonth) {
      return { status: 'info', label: 'Birth Month Not Set' };
    }

    // Evaluation status and annual evaluation both exist
    if (currentSoldier?.evaluationStatus && currentSoldier?.annualEvaluation) {
      return determineEvaluationStatus(currentSoldier.evaluationStatus, currentSoldier.annualEvaluation);
    }
    return { status: '--', label: '--' };
  })();

  return (
    <>
      <Card
        sx={{
          mt: 3,
          mb: 3,
          p: 3,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.layout.background5 : theme.palette.layout.base,
          border: '1px solid transparent',
          '&:hover': {
            borderColor: 'transparent',
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Soldier Information</Typography>
          {hasRole('manager') && (
            <IconButton aria-label="edit" onClick={() => setEditOpen(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <CardContent sx={{ pl: 0, pr: 0 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Autocomplete
                options={
                  (currentUnit?.uic &&
                    soldiers
                      ?.slice()
                      .sort((a, b) => a.lastName.localeCompare(b.lastName))
                      .map((x: ISoldier) => ({
                        label: `${x.rank} ${x.firstName} ${x.lastName}`,
                        value: x.userId,
                      }))) ||
                  []
                }
                loading={soldiersLoading}
                value={
                  (maintainer?.id &&
                    soldiers
                      ?.slice()
                      .sort((a, b) => a.lastName.localeCompare(b.lastName))
                      .map((x: ISoldier) => ({
                        label: `${x.rank} ${x.firstName} ${x.lastName}`,
                        value: x.userId,
                      }))
                      .find((opt) => opt.value === maintainer.id)) ||
                  null
                }
                onChange={(_e, selected) => {
                  if (!selected) return;

                  const selectedSoldier = soldiers?.find((x: ISoldier) => x.userId === selected.value);

                  if (!selectedSoldier) return;

                  const newMaintainer: IMaintainer = {
                    id: selectedSoldier.userId,
                    name: `${selectedSoldier?.rank} ${selectedSoldier?.firstName} ${selectedSoldier?.lastName}`,
                    pv2Dor: selectedSoldier?.pv2Dor as string,
                    pfcDor: selectedSoldier?.pfcDor as string,
                    sfcDor: selectedSoldier?.sfcDor as string,
                    sgtDor: selectedSoldier?.sgtDor as string,
                    spcDor: selectedSoldier?.spcDor as string,
                    ssgDor: selectedSoldier?.ssgDor as string,
                    primaryMos: selectedSoldier?.primaryMos as string,
                    mos: selectedSoldier?.allMosAndMl ? Object.keys(selectedSoldier.allMosAndMl) : null,
                    ml: selectedSoldier?.allMosAndMl
                      ? Object.values(selectedSoldier.allMosAndMl).filter((v) => typeof v === 'string')
                      : null,
                  };
                  dispatch(setMaintainer(newMaintainer));
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Maintainer"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {soldiersLoading && (
                            <InputAdornment position="end">
                              <CircularProgress
                                sx={{ height: '18px !important', width: '18px !important' }}
                                color="inherit"
                              />{' '}
                            </InputAdornment>
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <StatusDisplay status={currentSoldier?.availabilityStatus as StatusType} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <CenterItem>
                <Typography variant="body1">Birth Month:</Typography>
                <Typography variant="body1" ml={3}>
                  {currentSoldier?.birthMonth ?? 'N/A'}
                </Typography>
              </CenterItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <CenterItem>
                <Typography variant="body1">Unit:</Typography>
                <Typography variant="body1" ml={3}>
                  {(currentUnit?.shortName as string) ?? 'N/A'}
                </Typography>
              </CenterItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <CenterItem>
                <Typography variant="body1">Arrival At Unit:</Typography>
                <Typography variant="body1" ml={3}>
                  {(currentSoldier?.arrivalAtUnit as string) ?? 'N/A'}
                </Typography>
              </CenterItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} />
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CenterItem>
                <Typography variant="body1">Primary MOS-ML:</Typography>
                <Typography variant="body1" ml={3}>
                  {(currentSoldier?.primaryMos as string) ?? 'n/a'} - {currentSoldier?.primaryMl ?? 'n/a'}
                </Typography>
              </CenterItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CenterItem>
                <Typography variant="body1">Other MOS-ML:</Typography>
                {currentSoldier?.allMosAndMl && showAdditionalMOS()}
              </CenterItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CenterItem>
                <Box display="flex">
                  <Typography variant="body1" {...(evaluation.status !== 'Met' && { pt: 4 })}>
                    Annual Evaluation:
                  </Typography>
                  {currentSoldier?.evaluationStatus && evaluation.status !== 'Met' && (
                    <PmxAlert
                      severity={evaluation.status as AlertColor}
                      variant="standard"
                      icon={<ErrorIcon />}
                      sx={{
                        '& .MuiAlert-icon': {
                          marginRight: 0,
                        },
                        '& .MuiAlert-message': {
                          pt: 3,
                        },
                      }}
                    >
                      <Box display="flex">
                        <Typography variant="body1" ml={1}>
                          {evaluation.label}
                        </Typography>
                        {hasRole('manager') && (
                          <Link
                            aria-label="Add"
                            component="button"
                            underline="always"
                            onClick={() => {
                              // if birth month exists then we're creating an evaluation instead. Else we're editing the soldier to create a birth month
                              if (currentSoldier?.birthMonth && currentSoldier?.birthMonth !== 'UNK') {
                                dispatch(setEventType('Evaluation'));
                                navigate('/amtp-packet/maintainer-record');
                                return;
                              }
                              setEditOpen(true);
                            }}
                            sx={{
                              ml: 2,
                              display: 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'underline',
                              gap: 0.5,
                            }}
                          >
                            <AddIcon sx={{ fontSize: '1.2rem' }} />
                            Add
                          </Link>
                        )}
                      </Box>
                    </PmxAlert>
                  )}
                  {evaluation.status === 'Met' && (
                    <Typography variant="body1" ml={3}>
                      {evaluation.label}
                    </Typography>
                  )}
                </Box>
              </CenterItem>
            </Grid>
            <Grid size={{ md: 12 }}>
              <PmxTimeline
                items={[
                  {
                    label: currentSoldier?.pv2Dor?.toString() ?? 'N/A',
                    icon: <img src={PV2Icon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'PV2',
                    isActive: !!currentSoldier?.pv2Dor,
                    disabled: !currentSoldier?.pv2Dor,
                  },
                  {
                    label: currentSoldier?.pfcDor?.toString() ?? 'N/A',
                    icon: <img src={PFCIcon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'PFC',
                    isActive: !!currentSoldier?.pfcDor,
                    disabled: !currentSoldier?.pfcDor,
                  },
                  {
                    label: currentSoldier?.spcDor?.toString() ?? 'N/A',
                    icon: <img src={SPCIcon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'SPC',
                    isActive: !!currentSoldier?.spcDor,
                    disabled: !currentSoldier?.spcDor,
                  },
                  {
                    label: currentSoldier?.sgtDor?.toString() ?? 'N/A',
                    icon: <img src={SGTIcon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'SGT',
                    isActive: !!currentSoldier?.sgtDor,
                    disabled: !currentSoldier?.sgtDor,
                  },
                  {
                    label: currentSoldier?.ssgDor?.toString() ?? 'N/A',
                    icon: <img src={SSGIcon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'SSG',
                    isActive: !!currentSoldier?.ssgDor,
                    disabled: !currentSoldier?.ssgDor,
                  },
                  {
                    label: currentSoldier?.sfcDor?.toString() ?? 'N/A',
                    icon: <img src={SFCIcon} alt="pv2-icon" width="28px" height="20px" />,
                    timeLabel: 'SFC',
                    isActive: !!currentSoldier?.sfcDor,
                    disabled: !currentSoldier?.sfcDor,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {currentSoldier && (
        <SoldierEditDialog
          open={editOpen}
          handleClose={() => setEditOpen(false)}
          handleUpdate={() => {
            setEditOpen(false);
            getSoldier({
              userId: maintainer?.id ?? '',
            });
          }}
          soldier={currentSoldier}
        />
      )}
    </>
  );
};

export default SoldierInformation;
