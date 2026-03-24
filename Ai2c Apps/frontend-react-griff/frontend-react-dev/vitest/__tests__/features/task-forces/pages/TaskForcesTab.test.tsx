import { describe, expect } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Echelon } from '@ai2c/pmx-mui';

import TaskForcesTab from '@features/task-forces/pages/TaskForcesTab';

import { useGetTaskforcesQuery } from '@store/griffin_api/taskforce/slices';

import { renderWithProviders } from '@vitest/helpers';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: vi.fn(({ children, to, ...rest }) => (
      <div data-testid={`mock-link-to-${to}`} {...rest}>
        {children}
      </div>
    )),
  };
});

vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeading: () => <div data-testid="taskforce-logo-heading">Taskforce Logo</div>,
}));

vi.mock('@features/task-forces/components/archived-filter/ArchivedTaskforceFilterForm', () => ({
  ArchivedTaskforceFilterForm: () => <div data-testid="archived-tf-filters">Archived Taskforce Filters</div>,
}));
 
const mockDeleteTaskforce = vi.fn();

vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useGetTaskforcesQuery: vi.fn(),
  useDeleteTaskforceMutation: vi.fn(() => [
    mockDeleteTaskforce,
    { isLoading: false },
  ]),
}));

const testLocation = {
  code: 'PITT',
  name: 'PITTSBURGH',
};

const testOwner = {
  user_id: '0000000000',
  rank: 'CTR',
  first_name: 'John',
  last_name: 'Doe',
};

const activeTaskforces = [
  {
    unit: {
      uic: 'UNIT1',
      shortName: 'UNIT1',
      displayName: 'ABC UNIT 1',
      echelon: Echelon.BATTALION,
      level: 1,
      parentUic: 'PARENT',
      slogan: 'Super cool slogan',
    },
    location: testLocation,
    owner: testOwner,
    startDate: '2026-01-01',
    endDate: '2050-01-01',
  },
  {
    unit: {
      uic: 'UNIT2',
      shortName: 'UNIT2',
      displayName: 'XYZ UNIT 2',
      echelon: Echelon.BATTALION,
      level: 1,
      parentUic: 'PARENT',
      slogan: 'An even cooler slogan',
    },
    location: testLocation,
    owner: testOwner,
    startDate: '2025-12-31',
    endDate: '2030-12-31',
  },
];

const archivedTaskforces = [
  {
    ...activeTaskforces[0],
    startDate: '2025-01-01',
    endDate: '2026-01-01',
  },
];

describe('TaskForceTab for My Taskforces', () => {
  beforeEach(() => {
    (useGetTaskforcesQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: activeTaskforces,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders basic components for My Taskforce page', () => {
    renderWithProviders(<TaskForcesTab archived={false} />);
    
    const taskforceCards = screen.getAllByTestId('taskforce-logo-heading');
    expect(taskforceCards).toHaveLength(activeTaskforces.length);

    const archivedFilters = screen.queryByTestId('archived-tf-filters');
    expect(archivedFilters).not.toBeInTheDocument();

    const viewBtn1 = screen.getByTestId(`view-btn-${activeTaskforces[0].unit.uic}`);
    const viewBtn2 = screen.getByTestId(`view-btn-${activeTaskforces[1].unit.uic}`);
    expect(viewBtn1).toBeInTheDocument();
    expect(viewBtn2).toBeInTheDocument();
    
    const deleteBtn1 = screen.getByTestId(`delete-btn-${activeTaskforces[0].unit.uic}`);
    const deleteBtn2 = screen.getByTestId(`delete-btn-${activeTaskforces[1].unit.uic}`);
    expect(deleteBtn1).toBeInTheDocument();
    expect(deleteBtn2).toBeInTheDocument();
  });

    test('Does not call delete task force when cancel is clicked', async () => {
    renderWithProviders(<TaskForcesTab archived={false} />);
    
    const taskforceCards = screen.getAllByTestId('taskforce-logo-heading');
    expect(taskforceCards).toHaveLength(activeTaskforces.length);

    const deleteBtn = screen.getByTestId(`delete-btn-${activeTaskforces[0].unit.uic}`);
    await userEvent.click(deleteBtn);

    expect(screen.getByText('Delete Task Force')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete?')).toBeInTheDocument();

    const cancelBtn = screen.getByTestId('cancel-btn');
    expect(cancelBtn).toBeInTheDocument();

    await userEvent.click(cancelBtn);

    expect(mockDeleteTaskforce).not.toHaveBeenCalled();
  });

  test('Calls delete task force when delete icon clicked and confirmed', async () => {
    renderWithProviders(<TaskForcesTab archived={false} />);
    
    const taskforceCards = screen.getAllByTestId('taskforce-logo-heading');
    expect(taskforceCards).toHaveLength(activeTaskforces.length);

    const deleteBtn = screen.getByTestId(`delete-btn-${activeTaskforces[0].unit.uic}`);
    await userEvent.click(deleteBtn);

    expect(screen.getByText('Delete Task Force')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete?')).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    expect(confirmBtn).toBeInTheDocument();

    await userEvent.click(confirmBtn);

    expect(mockDeleteTaskforce).toHaveBeenCalled();
  });
});

describe('TaskForceDetailsTab for Archived Taskforces', () => {
  beforeEach(() => {
    (useGetTaskforcesQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: archivedTaskforces,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders basic components for Archived page', () => {
    renderWithProviders(<TaskForcesTab archived={true} />);
    
    const taskforceCards = screen.getAllByTestId('taskforce-logo-heading');
    expect(taskforceCards).toHaveLength(archivedTaskforces.length);

    const archivedFilters = screen.getByTestId('archived-tf-filters');
    expect(archivedFilters).toBeInTheDocument();
    
    const viewBtn1 = screen.getByTestId(`view-btn-${archivedTaskforces[0].unit.uic}`);
    expect(viewBtn1).toBeInTheDocument();

    const deleteBtn1 = screen.queryByTestId(`delete-btn-${archivedTaskforces[0].unit.uic}`);
    expect(deleteBtn1).not.toBeInTheDocument();
  });
});