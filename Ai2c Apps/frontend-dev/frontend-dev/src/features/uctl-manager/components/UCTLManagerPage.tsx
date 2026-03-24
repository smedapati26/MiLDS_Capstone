import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useUnitAccess from '@hooks/useUnitAccess';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';

import { OrgNode } from '@components/PmxOrgChart';
import { ITasks } from '@features/task-explorer';
import { useLazyGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery, useLazyGetUnitHierarchyQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { buildOrgChartData } from '../helpers';
import { addRecentSearch, clearRecentSearches, removeRecentSearch } from '../slices/recentSearchesSlice';
import CreateTaskDialog from './CreateTaskDialog';
import FilterBar from './FilterBar';
import UCTLDetails from './UCTLDetails';
import UCTLForm from './UCTLForm';
import UCTLResults from './UCTLResults';

const UCTLManagerPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { hasRole } = useUnitAccess();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recentSearches = useAppSelector((state) => state.recentSearches.items);
  const [selectedSearch, setSelectedSearch] = useState<{ uic: string; title: string }>({ uic: '', title: '' });
  const [fetchMos, { data: allMOS }] = useLazyGetAllMOSQuery({});
  const { data: units } = useGetUnitsQuery({
    role: 'Manager',
  });
  const [fetchUnits, { data: unitHierarchy, isFetching }] = useLazyGetUnitHierarchyQuery();
  const [selectedUnit, setSelectedUnit] = useState<IUnitBrief | undefined>(undefined);
  const [listView, setListView] = useState<string>('org');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMOS, setSelectedMOS] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<OrgNode | null>(null);
  const [selectedGrandparentUnit, setSelectedGrandparentUnit] = useState<boolean>(false);
  const [selectedSubUnit, setSelectedSubUnit] = useState<string | null>(null);
  const [selectedOverallUnit, setSelectedOverallUnit] = useState<OrgNode | null>(null);
  const [createType, setCreateType] = useState<{ isCreate: boolean; createType: string | null } | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ITasks | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const triggerRefresh = () => {
    setShouldRefresh(true);
  };

  useEffect(() => {
    if (selectedUnit?.uic) {
      fetchUnits({ uic: selectedUnit.uic });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit, selectedSearch]);

  useEffect(() => {
    if (listView === 'list') {
      fetchMos();
    }
    if (createType?.isCreate) {
      fetchMos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listView, createType]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(addRecentSearch(searchQuery));
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const { parent, grandparent } = useMemo(() => {
    if (unitHierarchy) {
      return buildOrgChartData(unitHierarchy);
    }
    return {
      parent: { id: '', name: '', title: '', children: [], metaData: [] },
      grandparent: { id: '', name: '', title: '', children: [], metaData: [] },
    };
  }, [unitHierarchy]);

  const handleOverallUnit = useCallback(() => {
    if (listView === 'org') {
      if (grandparent?.id && selectedGrandparentUnit) {
        setSelectedOverallUnit(grandparent);
        return;
      }

      if (selectedSubUnit) {
        const matchingChild = parent.children?.find((child: OrgNode) => child.id === selectedSubUnit);
        if (matchingChild) {
          setSelectedOverallUnit(matchingChild);
        }
        return;
      }
      if (selectedUnit?.uic) {
        setSelectedOverallUnit(parent);
      }
      return;
    }

    if (selectedUnitId) {
      setSelectedOverallUnit(selectedUnitId);
    }
  }, [grandparent, parent, selectedGrandparentUnit, selectedSubUnit, selectedUnit, selectedUnitId, listView]);

  useEffect(() => {
    handleOverallUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrandparentUnit, selectedSubUnit, grandparent, parent, selectedUnit, selectedUnitId, listView]);

  return (
    <Box
      sx={{
        maxHeight: 'calc(100vh - 120px)',
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
      <Box display="flex" mb={2}>
        <Typography variant="h4">UCTL Manager</Typography>
      </Box>
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: 'relative' }}>
              {(createType?.isCreate || isEdit) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.palette.mode !== 'dark' ? `rgba(255, 255, 255, 0.3)` : `rgba(0, 0, 0, 0.3)`,
                    zIndex: 10,
                    pointerEvents: 'auto',
                  }}
                />
              )}
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  overflowY: 'auto',
                }}
              >
                <FilterBar
                  selectedSearch={selectedSearch}
                  setSelectedSearch={(val) => {
                    setSelectedSearch(val);
                    fetchUnits({ uic: val.uic });
                  }}
                  handleCreate={(val) => setCreateType({ isCreate: true, createType: val })}
                  listView={listView}
                  setListView={setListView}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  recentSearches={recentSearches}
                  onRecentSearchClick={(text) => {
                    setSearchQuery(text);
                    dispatch(addRecentSearch(text));
                  }}
                  onRemoveRecent={(text) => dispatch(removeRecentSearch(text))}
                  onClearAllRecent={() => dispatch(clearRecentSearches())}
                  units={units ?? []}
                  selectedUnit={selectedUnit}
                  setSelectedUnit={(val) => {
                    setSelectedUnit(val);
                    if (val?.uic) fetchUnits({ uic: val.uic });
                  }}
                />

                <Divider
                  sx={{
                    mt: 4,
                    mb: 4,
                    borderColor: theme.palette.mode === 'light' ? theme.palette.grey.l40 : theme.palette.grey.d40,
                  }}
                />
                <UCTLResults
                  listView={listView}
                  parent={parent}
                  grandparent={grandparent}
                  allMOS={allMOS}
                  setSelectedMOS={setSelectedMOS}
                  setSkillLevel={setSkillLevel}
                  isFetching={isFetching}
                  setSelectedGrandparentUnit={setSelectedGrandparentUnit}
                  setSelectedSubUnit={setSelectedSubUnit}
                  selectedUnit={selectedUnitId}
                  setSelectedUnit={setSelectedUnitId}
                />
              </Paper>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                overflowY: 'auto',
              }}
            >
              {createType?.createType !== 'Create UCTL' && !isEdit && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Details</Typography>
                    {hasRole('manager') && (
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        disabled={!selectedUnit}
                        onClick={() => setIsEdit(true)}
                      >
                        Edit UCTL
                      </Button>
                    )}
                  </Box>
                  <UCTLDetails
                    unit={selectedOverallUnit}
                    skillLevel={listView === 'org' ? (skillLevel as string) : null}
                    mos={listView === 'org' ? (selectedMOS as string) : null}
                    shouldRefresh={shouldRefresh}
                    onRefreshHandled={() => setShouldRefresh(false)}
                  />
                </>
              )}
              {((createType?.isCreate && createType?.createType === 'Create UCTL') || isEdit) && (
                <>
                  <Box mb={2}>
                    <Typography variant="h6">{isEdit ? 'Edit' : 'Create'} UCTL</Typography>
                  </Box>
                  <UCTLForm
                    isCreate={!isEdit}
                    mos={selectedMOS}
                    selectedSkillLevel={skillLevel}
                    allMOS={allMOS}
                    selectedUnit={selectedUnit}
                    handleTaskEdit={(val) => setTaskToEdit(val)}
                    handleCancel={() => {
                      setCreateType({ isCreate: false, createType: null });
                      setIsEdit(false);
                    }}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <CreateTaskDialog
        task={taskToEdit}
        selectedUnit={selectedUnit}
        mos={selectedMOS}
        skillLevel={skillLevel}
        open={!!(createType?.isCreate && createType?.createType === 'Create Task') || !!taskToEdit}
        onClose={() => {
          setTaskToEdit(null);
          setCreateType({ isCreate: false, createType: null });
          triggerRefresh();
        }}
      />
    </Box>
  );
};

export default UCTLManagerPage;
