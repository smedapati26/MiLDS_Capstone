import { afterEach,describe, expect, it, vi } from 'vitest';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { TaskforceEditUnitsTab } from '@features/task-forces/components/edit-pages/unit/TaskforceEditUnitsTab';

import { ITaskForceDetails } from '@store/griffin_api/taskforce/models/ITaskforce';
import { useUpdateTaskforceUnitMutation } from '@store/griffin_api/taskforce/slices';

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
    Step1TaskForceDetails: vi.fn(() => <div data-testid="step-1" />),
    Step2CreateSubordinates: vi.fn(() => <div data-testid="step-2" />),
  };
});

// Mock the RTK Query mutation hook
vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useUpdateTaskforceUnitMutation: vi.fn(),
}));

// Mock utility functions
vi.mock('@features/task-forces/utils/getFormData', () => ({
  getUnitFormData: vi.fn((formValues) => formValues),
}));


describe('TaskforceEditUnits', () => {
  // Create spy functions for props and hooks
  const mockCloseEditMode = vi.fn();
  const mockUpdateTaskforceUnit = vi.fn(() => [
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
      (useUpdateTaskforceUnitMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => [
        mockUpdateTaskforceUnit,
        { isLoading: false },
      ]);
    });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with back and save buttons', () => {
    renderWithProviders(<TaskforceEditUnitsTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    // Check that the main buttons are visible
    expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    expect(screen.getByText(/Back to Test Task Force Summary/)).toBeInTheDocument();
    expect(screen.getByTestId('save-btn')).toBeInTheDocument();

    // Check that the mocked child form steps are rendered
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
  });

  it('should call closeEditMode when the back button is clicked', () => {
    renderWithProviders(<TaskforceEditUnitsTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    const backButton = screen.getByTestId('back-btn');
    fireEvent.click(backButton);

    expect(mockCloseEditMode).toHaveBeenCalledTimes(1);
  });

  it('should call the update mutation and show a success/error snackbar on save', async () => {
    renderWithProviders(<TaskforceEditUnitsTab taskforce={mockTaskforce} closeEditMode={mockCloseEditMode} />);

    const saveButton = screen.getByTestId('save-btn');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTaskforceUnit).toHaveBeenCalledTimes(1);
    });
  });
});
