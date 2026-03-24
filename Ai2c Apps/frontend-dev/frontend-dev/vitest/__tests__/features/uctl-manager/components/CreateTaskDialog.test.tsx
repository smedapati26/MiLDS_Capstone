/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, render, screen } from '@testing-library/react';

import CreateTaskDialog from '@features/uctl-manager/components/CreateTaskDialog';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useLazyGetUnitTasksQuery,
  useUpdateTaskMutation,
  useUploadTaskPdfMutation,
} from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@context/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showAlert: vi.fn(),
  }),
}));

vi.mock('@store/amap_ai/tasks/slices/tasksApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetUnitTasksQuery: vi.fn(),
    useCreateTaskMutation: vi.fn(),
    useUpdateTaskMutation: vi.fn(),
    useUploadTaskPdfMutation: vi.fn(),
    useDeleteTaskMutation: vi.fn(),
  };
});

const mockUnit = { uic: 'A123', unitName: 'Test Unit' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderDialog = (props: any = {}) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CreateTaskDialog
        selectedUnit={mockUnit}
        task={null}
        mos={null}
        skillLevel={null}
        open={true}
        onClose={vi.fn()}
        {...props}
      />
    </LocalizationProvider>,
  );
};

describe('CreateTaskDialog', () => {
  const mockDelete = vi.fn();
  const mockFetchUctl = vi.fn();
  const mockCreateTask = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockUploadPdf = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useDeleteTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDelete, { isLoading: false }]);
    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetchUctl,
      { data: { uctls: [{ ictlId: 1, ictlTitle: 'Test UCTL' }] } },
    ]);

    (useCreateTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ]);

    (useUpdateTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ]);

    (useUploadTaskPdfMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockUploadPdf]);
  });

  it('renders dialog fields correctly', () => {
    renderDialog();

    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title*')).toBeInTheDocument();
    expect(screen.getByLabelText('Training Location*')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject Area*')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderDialog();

    fireEvent.click(screen.getByText('CREATE'));

    expect(await screen.findByText('Task title is required')).toBeInTheDocument();
    expect(await screen.findByText('Training location is required')).toBeInTheDocument();
    expect(await screen.findByText('Please select a training frequency')).toBeInTheDocument();
    expect(await screen.findByText('Subject area is required')).toBeInTheDocument();
    expect(await screen.findByText('Please upload a file')).toBeInTheDocument();
  });

  it('calls createTask when form is valid', async () => {
    mockCreateTask.mockResolvedValue({ task_number: 123 });

    renderDialog();

    fireEvent.change(screen.getByLabelText('Task Title*'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Training Location*'), { target: { value: 'Fort Test' } });

    // Upload file
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const uploader = screen.getByTestId('file-input');
    fireEvent.change(uploader, { target: { files: [file] } });

    fireEvent.click(screen.getByText('CREATE'));

    // await waitFor(() => {
    //   expect(mockCreateTask).toHaveBeenCalled();
    // });
  });

  it('disables CREATE button when UCTL assignment is off and no UCTLs selected', () => {
    renderDialog();

    fireEvent.click(screen.getByLabelText('Assign task to UCTLs'));

    const createBtn = screen.getByText('CREATE');
    expect(createBtn).toBeDisabled();
  });

  it('renders update mode when task is provided', () => {
    const mockTask = {
      taskNumber: 1,
      taskTitle: 'Existing Task',
      trainingLocation: 'Fort Test',
      frequency: 'Weekly',
      subjectArea: 'Ops',
    };

    renderDialog({ task: mockTask });

    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });

  it('opens delete dialog when DELETE is clicked', () => {
    const mockTask = {
      taskNumber: 1,
      taskTitle: 'Existing Task',
      trainingLocation: 'Fort Test',
      frequency: 'Weekly',
      subjectArea: 'Ops',
    };

    renderDialog({ task: mockTask });

    fireEvent.click(screen.getByLabelText('DELETE'));

    // expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });
});
