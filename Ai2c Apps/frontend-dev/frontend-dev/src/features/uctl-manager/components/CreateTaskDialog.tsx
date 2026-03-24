import { useEffect, useState } from 'react';

import { useSnackbar } from '@context/SnackbarProvider';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxFileUploader from '@components/PmxFileUploader';
import { ITasks } from '@features/task-explorer';
import {
  FetchUctlParams,
  useCreateTaskMutation,
  useLazyGetUnitTasksQuery,
  useUpdateTaskMutation,
  useUploadTaskPdfMutation,
} from '@store/amap_ai/tasks';
import { IUnitBrief } from '@store/amap_ai/units/models';

import DeleteTaskDialog from './DeleteTaskDialog';

const CreateTaskDialog = ({
  selectedUnit,
  task,
  mos,
  skillLevel,
  open,
  onClose,
}: {
  selectedUnit: IUnitBrief | undefined;
  task: ITasks | null;
  mos: string | null;
  skillLevel: string | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { showAlert } = useSnackbar();
  const [fetchUctl, { data }] = useLazyGetUnitTasksQuery();
  const [createTask, { isLoading: createLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updateLoading }] = useUpdateTaskMutation();
  const [uploadTaskPdf] = useUploadTaskPdfMutation();

  const [taskTitle, setTaskTitle] = useState('');
  const [trainingLocation, setTrainingLocation] = useState('');
  const [trainingFrequency, setTrainingFrequency] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [assignToUCTLs, setAssignToUCTLs] = useState(true);
  const [selectedUCTLs, setSelectedUCTLs] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [errors, setErrors] = useState({
    taskTitle: false,
    trainingLocation: false,
    trainingFrequency: false,
    subjectArea: false,
    attachedFile: false,
  });

  useEffect(() => {
    if (!selectedUnit?.uic) return;

    const params: FetchUctlParams = { uic: selectedUnit.uic };
    if (mos) params.mos = mos;
    if (skillLevel) params.skill_level = skillLevel;

    fetchUctl(params);
  }, [selectedUnit, mos, skillLevel, fetchUctl]);

  useEffect(() => {
    if (task) {
      setTaskTitle(task.taskTitle || '');
      setTrainingLocation(task.trainingLocation || '');
      setTrainingFrequency(task.frequency || '');
      setSubjectArea(task.subjectArea || '');
      setAssignToUCTLs(false);
    }
  }, [task]);

  const handleSubmit = async () => {
    const newErrors = {
      taskTitle: taskTitle.trim() === '',
      trainingLocation: trainingLocation.trim() === '',
      trainingFrequency: trainingFrequency.trim() === '',
      subjectArea: subjectArea.trim() === '',
      attachedFile: task ? false : attachedFile === null,
    };

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) return;

    const ictl_ids = assignToUCTLs ? selectedUCTLs?.map((id) => parseInt(id)) : [];

    try {
      if (task) {
        await updateTask({
          task_number: task.taskNumber,
          task_title: taskTitle,
          training_location: trainingLocation,
          frequency: trainingFrequency,
          subject_area: subjectArea,
        })
          .unwrap()
          .then()
          .finally(() => showAlert('Task Updated', 'success', false));
      } else {
        const formData = new FormData();
        formData.append('task_title', taskTitle);
        formData.append('training_location', trainingLocation);
        formData.append('frequency', trainingFrequency);
        formData.append('subject_area', subjectArea);
        ictl_ids.forEach((id) => formData.append('ictl_ids', id.toString()));
        formData.append('unit_task_pdf', '');

        const response = await createTask(formData)
          .unwrap()
          .then()
          .finally(() => showAlert('Task Created', 'success', false));

        if (attachedFile) {
          await uploadTaskPdf({
            task_number: response.task_number,
            unit_task_pdf: attachedFile,
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Task submission failed:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{task ? 'Update Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Task Title*"
                fullWidth
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                error={errors.taskTitle}
                helperText={errors.taskTitle ? 'Task title is required' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Training Location*"
                fullWidth
                value={trainingLocation}
                onChange={(e) => setTrainingLocation(e.target.value)}
                error={errors.trainingLocation}
                helperText={errors.trainingLocation ? 'Training location is required' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <PmxDropdown
                shrinkLabel
                label="Training Frequency*"
                options={['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually']}
                onChange={(val) => setTrainingFrequency(val as string)}
                value={trainingFrequency}
                error={errors.trainingFrequency}
                helperText={errors.trainingFrequency ? 'Please select a training frequency' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Subject Area*"
                fullWidth
                value={subjectArea}
                onChange={(e) => setSubjectArea(e.target.value)}
                error={errors.subjectArea}
                helperText={errors.subjectArea ? 'Subject area is required' : ''}
              />
            </Grid>

            {!task && (
              <Grid size={{ xs: 12 }}>
                <PmxFileUploader attachedFile={attachedFile} setAttachedFile={setAttachedFile} />
                {errors.attachedFile && (
                  <Typography color="error" variant="body2" mt={1}>
                    Please upload a file
                  </Typography>
                )}
              </Grid>
            )}

            {!task && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Checkbox checked={assignToUCTLs} onChange={(e) => setAssignToUCTLs(e.target.checked)} />}
                  label="Assign task to UCTLs"
                />
              </Grid>
            )}

            {!task && assignToUCTLs && (
              <Grid size={{ xs: 12 }}>
                <PmxDropdown
                  multiple
                  label="UCTLs"
                  value={selectedUCTLs}
                  options={data?.uctls?.map((x) => ({ label: x.ictlTitle, value: x.ictlId.toString() })) ?? []}
                  renderChips
                  onChange={(val) => setSelectedUCTLs(val as string[])}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions {...(task && { sx: { justifyContent: 'space-between' } })}>
          {task && (
            <Button aria-label="DELETE" variant="outlined" color="error" onClick={() => setConfirmDelete(true)}>
              DELETE
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose}>CANCEL</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              {...(!task && { disabled: !assignToUCTLs && selectedUCTLs.length === 0 })}
              startIcon={
                createLoading || updateLoading ? (
                  <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                ) : null
              }
            >
              {task ? 'UPDATE' : 'CREATE'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* DELETE TASK DIALOG */}
      {task && (
        <DeleteTaskDialog
          task={task}
          open={confirmDelete}
          handleClose={() => {
            setConfirmDelete(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default CreateTaskDialog;
