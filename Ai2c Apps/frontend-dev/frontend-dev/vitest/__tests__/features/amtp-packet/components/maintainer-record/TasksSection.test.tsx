import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import TasksSection from '@features/amtp-packet/components/maintainer-record/TasksSection';
import { EventType } from '@store/amap_ai/events';

describe('TasksSection Component', () => {
  const mockSetTaskType = vi.fn();
  const mockSetTasks = vi.fn();
  const mockSetIsTaskCheckboxChecked = vi.fn();
  const mockHandleTasksChange = vi.fn();
  const mockSetTableData = vi.fn();

  const defaultProps = {
    showTaskCheckbox: true,
    taskType: '',
    setTaskType: mockSetTaskType,
    tasks: [],
    setTasks: mockSetTasks,
    fetchingTasks: false,
    userTasks: [{ taskNumber: '001', taskTitle: 'Task One', mos: '11B' }],
    isTaskCheckboxChecked: false,
    setIsTaskCheckboxChecked: mockSetIsTaskCheckboxChecked,
    handleTasksChange: mockHandleTasksChange,
    tableData: [],
    setTableData: mockSetTableData,
    selectedEventType: 'Training' as EventType,
  };

  it('renders the task checkbox when showTaskCheckbox is true', () => {
    render(<TasksSection {...defaultProps} />);

    expect(screen.getByLabelText('Associate Task(s) to Event')).toBeInTheDocument();
  });

  it('toggles task checkbox and updates task type', () => {
    render(<TasksSection {...defaultProps} />);
    const checkbox = screen.getByLabelText('Associate Task(s) to Event');

    fireEvent.click(checkbox);

    expect(mockSetIsTaskCheckboxChecked).toHaveBeenCalledWith(true);
    expect(mockSetTaskType).toHaveBeenCalledWith('ctl-tasks');
  });

  it('renders task toggle button group when event type is Training or Evaluation', () => {
    render(<TasksSection {...defaultProps} selectedEventType={'Evaluation'} />);

    expect(screen.getByText('SOLDIER CTL TASKS')).toBeInTheDocument();
    expect(screen.getByText('SEARCH ALL TASKS')).toBeInTheDocument();
  });

  it('renders task autocomplete component when userTasks are available', () => {
    render(<TasksSection {...defaultProps} isTaskCheckboxChecked={true} />);

    expect(screen.getByLabelText('Tasks')).toBeInTheDocument();
  });

  it('renders table when task checkbox is checked', () => {
    render(<TasksSection {...defaultProps} isTaskCheckboxChecked={true} />);

    expect(screen.getByText('Designate the results for each task.')).toBeInTheDocument();
  });
});
