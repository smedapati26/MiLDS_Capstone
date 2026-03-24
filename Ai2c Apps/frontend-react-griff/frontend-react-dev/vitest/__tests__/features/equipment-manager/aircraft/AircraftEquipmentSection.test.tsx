/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AircraftEquipmentDetailsSection from '@features/equipment-manager/aircraft/AircraftEquipmentSection';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { mapToAircraftEquipmentDetails } from '@store/griffin_api/aircraft/models';
import { useGetAircraftEquipmentDetailsQuery } from '@store/griffin_api/aircraft/slices';
import {
  useCancelAcdUploadMutation,
  useGetAcdUploadLatestHistoryQuery,
  useUploadAcdMutation,
} from '@store/griffin_api/auto_dsr/slices';
import { mapToMods } from '@store/griffin_api/mods/models';
import { useGetSelectedModsByUicQuery } from '@store/griffin_api/mods/slices';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockAircraftEquipmentDetailsDto } from '@vitest/mocks/griffin_api_handlers/aircraft/mock_data';
import { mockLatestHistory } from '@vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';
import { mockMods2Dto } from '@vitest/mocks/griffin_api_handlers/mods/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftEquipmentDetailsQuery: vi.fn(),
}));
vi.mock('@store/griffin_api/mods/slices', () => ({
  useGetSelectedModsByUicQuery: vi.fn(),
}));
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAcdUploadLatestHistoryQuery: vi.fn(),
  useUploadAcdMutation: vi.fn(),
  useCancelAcdUploadMutation: vi.fn(),
}));

vi.mock('@features/equipment-manager/EquipmentManagerContext', () => ({
  useEquipmentManagerContext: vi.fn(),
}));

// Mock all child components to simple stubs
vi.mock('@features/equipment-manager/components/EquipmentManagerDetails', () => ({
  default: (props: any) => (
    <div data-testid="EquipmentManagerDetails">
      <button data-testid="select-single" onClick={() => props.setRowCheck({ serial1: true })}>
        Select Single
      </button>
      <button data-testid="select-multi" onClick={() => props.setRowCheck({ serial1: true, serial2: true })}>
        Select Multi
      </button>
      <button data-testid="edit-btn" onClick={() => props.onEditClick && props.onEditClick()}>
        Edit
      </button>
    </div>
  ),
}));

vi.mock('@features/equipment-manager/components/EquipmentManagerModKits', () => ({
  default: (props: any) => <div data-testid="EquipmentManagerModKits">{props.children}</div>,
}));
vi.mock('@features/equipment-manager/aircraft/AircraftModsKits', () => ({
  default: () => <div data-testid="AircraftModsKits" />,
}));
vi.mock('@features/equipment-manager/aircraft/AircraftSingleEdit', () => ({
  default: (props: any) => {
    if (props.open) {
      setTimeout(() => props.setShowSnackbar(true), 0);
      return <div data-testid="AircraftSingleEdit" />;
    }
    return null;
  },
}));
vi.mock('@features/equipment-manager/aircraft/AircraftMultiEdit', () => ({
  default: (props: any) => {
    if (props.open) {
      // Simulate edit complete and show snackbar
      setTimeout(() => props.setShowSnackbar(true), 0);
      return <div data-testid="AircraftMultiEdit" />;
    }
    return null;
  },
}));
vi.mock('@components/data-tables', () => ({
  PmxCommentTooltip: (props: any) => <div data-testid="PmxCommentTooltip">{props.children}</div>,
  ColumnConfig: {},
}));
vi.mock('@components/index', () => ({
  PmxEllipsisText: (props: any) => <span data-testid="PmxEllipsisText">{props.text}</span>,
}));
vi.mock('@features/equipment-manager/components/helper', () => ({
  GetORThemeColor: () => '#123',
  Status: (props: any) => <span data-testid="Status">{props.status}</span>,
}));
vi.mock('@utils/helpers', () => ({
  formatNumbers: (val: any) => val,
}));
vi.mock('@features/equipment-manager/aircraft/components/ModsTooltip', () => ({
  default: () => <div data-testid="ModsTooltip" />,
}));

// Mock mutation function and result
const mockUploadAcd = vi.fn();
const mockUploadAcdResult = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: undefined,
  data: undefined,
  reset: vi.fn(),
};

// Mock mutation function and result for cancel
const mockCancelAcdUpload = vi.fn();
const mockCancelAcdUploadResult = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: undefined,
  data: undefined,
  reset: vi.fn(),
};

// Import the component under test

describe('AircraftEquipmentDetailsSection', () => {
  beforeEach(() => {
    (useEquipmentManagerContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      chosenUic: 'UIC123',
    });
    (useGetAircraftEquipmentDetailsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAircraftEquipmentDetailsDto.map(mapToAircraftEquipmentDetails),
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    (useGetSelectedModsByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockMods2Dto.map(mapToMods),
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    (useGetAcdUploadLatestHistoryQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockLatestHistory,
      isLoading: false,
      isError: false,
    });
    (useCancelAcdUploadMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockCancelAcdUpload,
      mockCancelAcdUploadResult,
    ]);

    (useUploadAcdMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockUploadAcd, mockUploadAcdResult]);

    render(
      <ThemedTestingComponent>
        <AircraftEquipmentDetailsSection />
      </ThemedTestingComponent>,
    );
  });
  it('renders the main section and children when data is present', () => {
    expect(screen.getByTestId('em-aircraft-equipment-details')).toBeInTheDocument();
    expect(screen.getByText(/Equipment/i)).toBeInTheDocument();
    expect(screen.getByTestId('EquipmentManagerModKits')).toBeInTheDocument();
    expect(screen.getByTestId('AircraftModsKits')).toBeInTheDocument();
    expect(screen.getByTestId('EquipmentManagerDetails')).toBeInTheDocument();
  });
  it('opens AircraftMultiEdit when multiple rows are selected and edit is clicked', async () => {
    // Simulate selecting multiple rows
    // You may need to adjust this depending on your checkbox implementation
    // fireEvent.click(screen.getByTestId('row-checkbox-serial1'));
    // fireEvent.click(screen.getByTestId('row-checkbox-serial2'));

    // Simulate clicking the Edit button

    fireEvent.click(screen.getByTestId('select-multi')); // select multiple rows
    fireEvent.click(screen.getByTestId('edit-btn')); // click edit

    // AircraftMultiEdit should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('AircraftMultiEdit')).toBeInTheDocument();
    });
  });

  it('opens AircraftSingleEdit when one row is selected and edit is clicked, and shows snackbar', async () => {
    // Simulate selecting a single row
    fireEvent.click(screen.getByTestId('select-single'));
    // Simulate clicking the Edit button
    fireEvent.click(screen.getByTestId('edit-btn'));

    // AircraftSingleEdit should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('AircraftSingleEdit')).toBeInTheDocument();
    });

    // Wait for snackbar to appear
    await waitFor(() => {
      expect(screen.getByTestId('aircraft-edit-undo-snackbar')).toBeInTheDocument();
      expect(screen.getByTestId('aircraft-edit-undo-snackbar')).toHaveTextContent('information updated.');
    });
  });

  it('shows snackbar with correct message after edit', async () => {
    // Simulate selecting multiple rows
    fireEvent.click(screen.getByTestId('select-multi'));
    // Simulate clicking the Edit button
    fireEvent.click(screen.getByTestId('edit-btn'));

    // Wait for AircraftMultiEdit to render and trigger snackbar
    await waitFor(() => {
      expect(screen.getByTestId('AircraftMultiEdit')).toBeInTheDocument();
    });

    // Wait for snackbar to appear
    await waitFor(() => {
      expect(screen.getByTestId('aircraft-edit-undo-snackbar')).toBeInTheDocument();
      expect(screen.getByTestId('aircraft-edit-undo-snackbar')).toHaveTextContent('information updated.');
    });
  });
});

describe('AircraftEquipmentDetailsSection empty', () => {
  beforeEach(() => {
    (useEquipmentManagerContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      chosenUic: 'UIC123',
    });
    (useGetAircraftEquipmentDetailsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    (useGetSelectedModsByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <AircraftEquipmentDetailsSection />
      </ThemedTestingComponent>,
    );
  });
  it('renders nothing if no data is present', () => {
    expect(screen.queryByTestId('em-aircraft-equipment-details')).not.toBeInTheDocument();
  });
});
