import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { describe, expect } from 'vitest';

import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Echelon } from '@ai2c/pmx-mui';

import TaskForceDetailsTab from '@features/task-forces/pages/TaskForceDetailsTab';

import { ITaskForceDetails } from '@store/griffin_api/taskforce/models/ITaskforce';

import { renderWithProviders } from '@vitest/helpers';

const mockNavigate = vi.fn();

const location = {
  pathname: '',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

const mockTaskforce: ITaskForceDetails = {
  subordinates: [],
  unit: {
    uic: 'TF-00001',
    shortName: 'TF-1',
    displayName: 'TASKFORCE ONE',
    echelon: Echelon.BATTALION,
    level: 0,
    parentUic: '',
  },
  startDate: '12-01-2025',
  endDate: '12-01-2030',
  aircraft: [],
  uas: [],
  agse: []
};

vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useGetTaskforceDetailsQuery: vi.fn(() => ({ data: mockTaskforce })),
}));

// Mock child components
vi.mock('@components/data-tables', () => ({
  /* eslint-disable @typescript-eslint/no-explicit-any */
  PmxCollapsibleTreeTable: ({ rows }: any) => <div data-testid="pmx-collapsible-table">{JSON.stringify(rows)}</div>,
}));

vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeading: () => <div data-testid="taskforce-logo-heading">Taskforce Logo</div>,
}));

describe('TaskForceDetailsTab', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({uic: 'TEST'});
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });
  
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('Renders components for My Task Force Details Page', () => {
    vi.mocked(useLocation).mockReturnValue({...location, pathname: '/list'});

    renderWithProviders(<TaskForceDetailsTab />);

    const backButton = screen.getByTestId('navigation-back-btn');
    const backButtonText = screen.getByText('Back to My Task Forces');
    expect(backButton).toBeInTheDocument();
    expect(backButtonText).toBeInTheDocument();
    
    const editUnitsButton = screen.getByText('Edit Units');
    const editEquipmentButton = screen.getByText('Edit Equipment');
    expect(editUnitsButton).toBeInTheDocument();
    expect(editEquipmentButton).toBeInTheDocument();

    expect(screen.getByTestId('taskforce-logo-heading')).toBeInTheDocument();
    expect(screen.getByTestId('pmx-collapsible-table')).toBeInTheDocument();
  });

  test('Renders components for Archived Task Force Details Page', () => {
    vi.mocked(useLocation).mockReturnValue({...location, pathname: '/archived'});

    renderWithProviders(<TaskForceDetailsTab />);

    const backButton = screen.getByTestId('navigation-back-btn');
    const backButtonText = screen.getByText('Back to Archived Task Forces');
    expect(backButton).toBeInTheDocument();
    expect(backButtonText).toBeInTheDocument();

    const editUnitsButton = screen.queryByText('Edit Units');
    const editEquipmentButton = screen.queryByText('Edit Equipment');
    expect(editUnitsButton).not.toBeInTheDocument();
    expect(editEquipmentButton).not.toBeInTheDocument();

    expect(screen.getByTestId('taskforce-logo-heading')).toBeInTheDocument();
    expect(screen.getByTestId('pmx-collapsible-table')).toBeInTheDocument();
  });

  test('Calls mockNavigate when clicking back button', async () => {
    vi.mocked(useLocation).mockReturnValue({...location, pathname: '/list'});

    renderWithProviders(<TaskForceDetailsTab />);

    const backButton = screen.getByTestId('navigation-back-btn');
    expect(backButton).toBeInTheDocument();

    await userEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
