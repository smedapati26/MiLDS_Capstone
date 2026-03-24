import { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Paper, TextField, Tooltip } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import { UnitSelect } from '@components/UnitSelect';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import { ITasks, IUCTLTasks } from '@features/task-explorer';
import {
  FetchUctlParams,
  useCreateUctlMutation,
  useLazyCheckDuplicateQuery,
  useLazyGetUnitTasksQuery,
  useLazyGetUserTasksQuery,
  useUpdateUctlMutation,
} from '@store/amap_ai/tasks';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';
import { SkillLevel, StatusType } from '@utils/constants';

import DeleteTaskDialog from './DeleteTaskDialog';
import DeleteUCTLDialog from './DeleteUCTLDialog';
import UCTLTable from './UCTLTable';

interface UCTLFormProps {
  isCreate: boolean;
  allMOS?: { mos: string }[];
  handleTaskEdit: (val: ITasks) => void;
  selectedUnit: IUnitBrief | undefined;
  mos: string | null;
  selectedSkillLevel: string | null;
  handleCancel: () => void;
}

type RowValue = string | number | null;

const UCTLForm = ({
  selectedUnit,
  mos,
  selectedSkillLevel,
  allMOS,
  isCreate,
  handleTaskEdit,
  handleCancel,
}: UCTLFormProps) => {
  const { data: allUnits, isSuccess } = useGetUnitsQuery({
    role: 'Manager',
  });
  const { appUser } = useAppSelector((state) => state.appSettings);
  const [getAllTasks, { data: userTasks }] = useLazyGetUserTasksQuery();
  const [fetchUctl, { data }] = useLazyGetUnitTasksQuery();
  const [checkDuplicate] = useLazyCheckDuplicateQuery();
  const [createUctl, { isLoading: creatingUctl }] = useCreateUctlMutation();
  const [updateUctl, { isLoading: updatingUctl }] = useUpdateUctlMutation();

  const [selectedMOS, setSelectedMOS] = useState<string | null>(mos ?? null);
  const [skillLevel, setSkillLevel] = useState<string | null>(selectedSkillLevel ?? null);
  const [unit, setUnit] = useState<IUnitBrief | undefined>(selectedUnit ?? undefined);
  const [taskListTitle, setTaskListTitle] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [selectedTasks, setSelectedTasks] = useState<ITasks[]>([]);
  const [duplicateMatch, setDuplicateMatch] = useState<null | {
    title: string;
    similarity_score: number;
    ictl_id: number;
  }>(null);
  const [isDeleteUCTL, setIsDeleteUCTL] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<ITasks | null>(null);

  useEffect(() => {
    if (!appUser?.userId) return;
    getAllTasks({ user_id: appUser.userId, all_tasks: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser]);

  const getUCTL = () => {
    if (!unit?.uic) return;

    const params: FetchUctlParams = { uic: unit.uic };
    if (selectedMOS) params.mos = selectedMOS;
    if (skillLevel) params.skill_level = skillLevel;

    fetchUctl(params);
  };

  useEffect(() => {
    getUCTL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit, unit, selectedMOS, skillLevel]);

  const selectedUctl: IUCTLTasks | undefined = unit && data?.uctls?.find((uctl) => uctl.unitUic === unit.uic);

  useEffect(() => {
    if (!selectedUctl) return;

    if (!isCreate) {
      setTaskListTitle(selectedUctl.ictlTitle ?? '');
      setTargetAudience(selectedUctl.targetAudience ?? '');
      setSelectedTasks(selectedUctl.tasks ?? []);
    }
  }, [selectedUctl, isCreate]);

  const handleSave = async () => {
    if (!unit?.uic || !selectedMOS || !skillLevel || !taskListTitle.trim()) return;

    const payload = {
      title: taskListTitle.trim(),
      unit_uic: unit.uic,
      mos_codes: [selectedMOS],
      skill_level: skillLevel,
      target_audience: targetAudience.trim(),
      tasks: selectedTasks?.map((x) => x.taskNumber) ?? [],
    };

    try {
      if (isCreate) {
        const { data: duplicateData } = await checkDuplicate({
          proposed_title: payload.title,
          mos_codes: payload.mos_codes,
          skill_levels: [payload.skill_level],
        });

        const matches = duplicateData?.matches ?? [];
        if (matches.length > 0) {
          const bestMatch = matches.reduce((prev, curr) =>
            curr.similarity_score > prev.similarity_score ? curr : prev,
          );
          setDuplicateMatch(bestMatch);
          return;
        }

        setDuplicateMatch(null);
        await createUctl(payload)
          .unwrap()
          .then()
          .finally(() => handleCancel());
      } else {
        if (selectedUctl?.ictlId) {
          await updateUctl({ ictl_id: selectedUctl.ictlId, ...payload })
            .unwrap()
            .then()
            .finally(() => handleCancel());
        }
      }
    } catch (error) {
      console.error('Failed to save UCTL:', error);
    }
  };

  const validForm = taskListTitle.trim() && unit?.uic && selectedMOS && skillLevel;
  const actionLabel = isCreate ? 'Create' : 'Save';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Critical Task List Title*"
            value={taskListTitle}
            onChange={(e) => setTaskListTitle(e.target.value)}
            fullWidth
          />

          <UnitSelect
            units={isSuccess ? allUnits : []}
            onChange={(val) => setUnit(val)}
            value={unit as IUnitBrief}
            readOnly={false}
            width="100%"
            label="Unit"
          />

          <Box display="flex" justifyContent="space-between" gap={3}>
            <Box sx={{ flex: 1 }}>
              <PmxDropdown
                shrinkLabel
                renderChips
                options={allMOS?.map((x) => x.mos) ?? []}
                value={selectedMOS as string}
                label="MOS*"
                onChange={(value: string | string[]) => {
                  if (typeof value === 'string') setSelectedMOS(value);
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <PmxDropdown
                shrinkLabel
                options={Object.values(SkillLevel)}
                value={skillLevel as string}
                label="Skill Level*"
                onChange={(value: string | string[]) => {
                  if (typeof value === 'string') setSkillLevel(value);
                }}
              />
            </Box>
          </Box>
          {duplicateMatch && (
            <Alert severity="error" variant="standard">
              <strong>UCTL Already Exists</strong>
              <br />
              Title: {duplicateMatch.title}
              <br />
              MOS: {selectedMOS}
              <br />
              SL: {skillLevel}
              <br />
              Please discard changes and edit the existing UCTL or change your selections.
            </Alert>
          )}
          <TextField
            label="Target Audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            fullWidth
          />
        </Box>
      </Paper>

      <Divider />

      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 600px)' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <UCTLTable
            allTasks={
              userTasks
                ? userTasks
                    .filter((task) => !selectedTasks.some((sel) => sel.taskNumber === task.taskNumber))
                    .map((x) => ({ id: x.taskNumber, value: x.taskTitle }))
                : []
            }
            selectedTasks={selectedTasks}
            setSelectedTasks={(taskId) => {
              if (userTasks) {
                const matchedTask = userTasks.find((task) => task.taskNumber === taskId);
                if (matchedTask && !selectedTasks.some((task) => task.taskNumber === matchedTask.taskNumber)) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-expect-error
                  setSelectedTasks((prev) => [...prev, matchedTask]);
                }
              }
            }}
            tableProps={{
              columns: [
                { field: 'taskNumber', header: 'Task #' },
                {
                  field: 'taskTitle',
                  header: 'Task Title',
                  renderCell: (_value: RowValue, row: ITasks) => (
                    <a href={row?.pdfUrl ?? '#'} target="_blank" rel="noreferrer">
                      {row.taskTitle}
                    </a>
                  ),
                },
                {
                  field: 'status',
                  header: 'Status',
                  renderCell: (_value: RowValue) => (
                    <StatusDisplay status={selectedUctl?.status as StatusType} iconOnly />
                  ),
                },
                {
                  field: 'frequency',
                  header: 'Actions',
                  renderCell: (_val: RowValue, row: ITasks) => {
                    return (
                      <Box display="flex">
                        <Tooltip title="Edit">
                          <IconButton
                            aria-label="edit"
                            onClick={() => {
                              handleTaskEdit(row);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            onClick={() => {
                              setTaskToDelete(row);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  },
                },
              ],
              data: selectedTasks ?? [],
              getRowId: (task: ITasks) => task.taskNumber,
            }}
          />
        </Box>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        {!isCreate && (
          <Button variant="outlined" color="error" onClick={() => setIsDeleteUCTL(true)}>
            DELETE
          </Button>
        )}

        <Box display="flex" gap={2}>
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>

          <Button onClick={handleSave} variant="contained" disabled={!validForm || creatingUctl}>
            {!creatingUctl || !updatingUctl ? (
              actionLabel
            ) : (
              <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
            )}
          </Button>
        </Box>
      </Box>

      {selectedUctl && (
        <DeleteUCTLDialog
          uctl={selectedUctl}
          open={isDeleteUCTL}
          handleClose={() => {
            setIsDeleteUCTL(false);
            handleCancel();
          }}
        />
      )}
      {taskToDelete && (
        <DeleteTaskDialog
          task={taskToDelete}
          open={!!taskToDelete}
          handleClose={() => {
            setTaskToDelete(null);
          }}
        />
      )}
    </Box>
  );
};

export default UCTLForm;
