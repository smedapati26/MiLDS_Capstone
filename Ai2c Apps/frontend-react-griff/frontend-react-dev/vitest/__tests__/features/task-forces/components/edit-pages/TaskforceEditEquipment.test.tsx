import { afterEach,describe, expect, it, vi } from 'vitest';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { TaskforceEditEquipmentTab } from '@features/task-forces/components/edit-pages/equipment/TaskforceEditEquipmentTab';

import { ITaskForceDetails } from '@store/griffin_api/taskforce/models/ITaskforce';
import { useUpdateTaskforceEquipmentMutation } from '@store/griffin_api/taskforce/slices';

import { renderWithProviders } from '@vitest/helpers';

// Mock the react-router-dom for blocking navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useBlocker: vi.fn(() => ({
      state: 'unblocked',
      location: { pathname: '/' },
      reset: vi.fn(),
      proceed: vi.fn(),
    })),
  };
});

// Mock child components from create-stepper
vi.mock('@features/task-forces/components/create-stepper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/task-forces/components/create-stepper')>();
  return {
    ...actual,
    Step3AddAircraft: vi.fn(() => <div data-testid="step-3" />),
    Step4AddUAS: vi.fn(() => <div data-testid="step-4" />),
    Step5AddAGSE: vi.fn(() => <div data-testid="step-5" />),
  };
});

vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeading: () => <div data-testid="taskforce-logo-heading">Taskforce Logo</div>,
}));

// Mock the RTK Query mutation hook
vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useUpdateTaskforceEquipmentMutation: vi.fn(),
}));

// Mock utility functions
vi.mock('@features/task-forces/utils/getFormData', () => ({
  getEquipmentFormData: vi.fn((formValues) => formValues),
}));


describe('TaskforceEditEquipment', () => {
  // Create spy functions for props and hooks
  const mockCloseEditMode = vi.fn();
  const mockUpdateTaskforceEquipment = vi.fn(() => [
    vi.fn().mockResolvedValue({ data: { success: true } }), // mock mutation function
    { isLoading: false }, // mock state object
  ])

  // Create mock taskforce data to pass as a prop
  const mockTaskforce: ITaskForceDetails = {
    unit: {
      uic: 'TF-12345',
      displayName: 'Test Task Force',
      shortName: 'TTF',
      nickName: 'The Testers',
      echelon: 'BDE',
      slogan: 'Test Unit Slogan',
      logo: undefined,
      level: 0,
      parentUic: ''
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    location: { id: 1, code: 'HOME', name: 'Home Base' },
    owner: {
      userId: '0000000000',
      firstName: 'John',
      lastName: 'Doe',
      rank: 'CTR',
      rankAndName: 'CTR John Doe',
    },
    aircraft: [],
    uas: [],
    agse: [],
    subordinates: [],
  };

  beforeEach(() => {
      (useUpdateTaskforceEquipmentMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => [
        mockUpdateTaskforceEquipment,
        { isLoading: false },
      ]);
    });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with back and save buttons', () => {
    renderWithProviders(<TaskforceEditEquipmentTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    expect(screen.getByTestId('taskforce-logo-heading')).toBeInTheDocument();

    // Check that the main buttons are visible
    expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    expect(screen.getByText(/Back to Test Task Force Summary/)).toBeInTheDocument();
    expect(screen.getByTestId('save-btn')).toBeInTheDocument();
  });

  it('should switch between equipment type tabs/steps', () => {
    renderWithProviders(<TaskforceEditEquipmentTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);
    
    // aircraft step 3 should be selected by default
    expect(screen.getByTestId('step-3')).toBeInTheDocument();
    expect(screen.queryByTestId('step-4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-5')).not.toBeInTheDocument();

    // switch to UAS tab
    const uasButton = screen.getByLabelText('UAS');
    fireEvent.click(uasButton);

    expect(screen.getByTestId('step-4')).toBeInTheDocument();
    expect(screen.queryByTestId('step-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-5')).not.toBeInTheDocument();

    // switch to AGSE tab
    const agseButton = screen.getByLabelText('AGSE');
    fireEvent.click(agseButton);

    expect(screen.getByTestId('step-5')).toBeInTheDocument();
    expect(screen.queryByTestId('step-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-4')).not.toBeInTheDocument();
  });

  it('should call closeEditMode when the back button is clicked', () => {
    renderWithProviders(<TaskforceEditEquipmentTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    const backButton = screen.getByTestId('back-btn');
    fireEvent.click(backButton);

    expect(mockCloseEditMode).toHaveBeenCalledTimes(1);
  });

  it('should call the update mutation and show a success/error snackbar on save', async () => {
    renderWithProviders(<TaskforceEditEquipmentTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    const saveButton = screen.getByTestId('save-btn');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTaskforceEquipment).toHaveBeenCalledTimes(1);
    });
  });
});
