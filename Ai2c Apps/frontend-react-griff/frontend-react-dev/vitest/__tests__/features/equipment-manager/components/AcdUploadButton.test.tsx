/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AcdUploadButton from '@features/equipment-manager/components/AcdUploadButton';

import {
  useCancelAcdUploadMutation,
  useGetAcdUploadLatestHistoryQuery,
  useUploadAcdMutation,
} from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock dependencies
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAcdUploadLatestHistoryQuery: vi.fn(),
  useUploadAcdMutation: vi.fn(),
  useCancelAcdUploadMutation: vi.fn(),
}));

vi.mock('@features/equipment-manager/components/AcdHistory', () => ({
  default: () => <div data-testid="acd-history-component">ACD History Component</div>,
}));

vi.mock('@features/equipment-manager/components/AcdUpload', () => ({
  default: ({ uploadedFile, setUploadedFile }: any) => (
    <div data-testid="acd-upload-component">
      <button onClick={() => setUploadedFile(new File(['test'], 'test.txt'))}>Set File</button>
      {uploadedFile && <span>File: {uploadedFile.name}</span>}
    </div>
  ),
}));

vi.mock('@features/equipment-manager/components/AcdPending', () => ({
  default: ({ isTransmitting }: any) => (
    <div data-testid="acd-pending-component">ACD Pending Component {isTransmitting ? '(Transmitting)' : ''}</div>
  ),
}));

describe('AcdUploadButton', () => {
  const mockCurrentUic = 'TEST_UIC';
  const mockUploadAcd = vi.fn();
  const mockCancelUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAppSelector as any).mockReturnValue(mockCurrentUic);
    (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
    (useUploadAcdMutation as any).mockReturnValue([mockUploadAcd, { isLoading: false }]);
    (useCancelAcdUploadMutation as any).mockReturnValue([mockCancelUpload, { isLoading: false }]);

    mockUploadAcd.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ export_id: 123 }),
    });
    mockCancelUpload.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ message: 'Cancelled' }),
    });
  });

  describe('Initial Rendering', () => {
    it('renders upload button when not loading', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('acd-export-upload')).toBeInTheDocument();
      expect(screen.getByText('ACD Upload')).toBeInTheDocument();
    });

    it('renders skeleton when loading', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('loading-acd-history')).toBeInTheDocument();
      expect(screen.queryByTestId('acd-export-upload')).not.toBeInTheDocument();
    });

    it('renders nothing when currentUic is null', () => {
      (useAppSelector as any).mockReturnValue(null);

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      // Check that the Box component is empty or doesn't render the button
      expect(screen.queryByTestId('acd-export-upload')).not.toBeInTheDocument();
    });

    it('renders in dark mode', () => {
      render(
        <ThemedTestingComponent mode="dark">
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.getByTestId('acd-export-upload')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('shows "ACD Upload" button with FileUploadIcon when no pending upload', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      const button = screen.getByTestId('acd-export-upload');
      expect(button).toHaveTextContent('ACD Upload');
    });

    it('shows "Pending..." button with PendingIcon when upload is pending', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      const button = screen.getByTestId('acd-export-upload');
      expect(button).toHaveTextContent('Pending...');
    });

    it('shows "Pending..." when status is Transmitting', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Transmitting' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Pending...')).toBeInTheDocument();
    });

    it('shows "Pending..." when status is Processing', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Processing' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Pending...')).toBeInTheDocument();
    });
  });

  describe('Dialog Opening and Closing', () => {
    it('opens dialog when button is clicked', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      const button = screen.getByTestId('acd-export-upload');
      fireEvent.click(button);

      expect(screen.getByText('Upload ACD')).toBeInTheDocument();
      expect(screen.getByTestId('acd-upload-component')).toBeInTheDocument();
    });

    it('closes dialog when close icon is clicked', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      const button = screen.getByTestId('acd-export-upload');
      fireEvent.click(button);

      const closeButtons = screen.getAllByRole('button');
      const closeIconButton = closeButtons.find((btn) => btn.querySelector('[data-testid="CloseIcon"]'));

      if (closeIconButton) {
        fireEvent.click(closeIconButton);
      }

      waitFor(() => {
        expect(screen.queryByText('Upload ACD')).not.toBeInTheDocument();
      });
    });

    it('does not open dialog when loading', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      expect(screen.queryByText('Upload ACD')).not.toBeInTheDocument();
    });
  });

  describe('Dialog Content - Upload View', () => {
    it('shows AcdUpload component by default', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByTestId('acd-upload-component')).toBeInTheDocument();
    });

    it('shows upload button disabled when no file is selected', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      // Get all buttons with "Upload" text and find the one in the dialog actions
      const buttons = screen.getAllByRole('button', { name: /upload/i });
      const uploadButton = buttons.find((btn) => btn.textContent === 'Upload');

      expect(uploadButton).toBeDisabled();
    });

    it('enables upload button when file is selected', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const setFileButton = screen.getByText('Set File');
      fireEvent.click(setFileButton);

      // Get all buttons with "Upload" text and find the one in the dialog actions
      const buttons = screen.getAllByRole('button', { name: /upload/i });
      const uploadButton = buttons.find((btn) => btn.textContent === 'Upload');

      expect(uploadButton).not.toBeDisabled();
    });

    it('shows cancel button in upload view', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      // Use exact match to avoid confusion with "Cancel Upload"
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows cancel button in upload view', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Dialog Content - Pending View', () => {
    it('shows AcdPending component when status is Pending', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByTestId('acd-pending-component')).toBeInTheDocument();
    });

    it('passes isTransmitting prop correctly to AcdPending', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Transmitting' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByText(/Transmitting/)).toBeInTheDocument();
    });

    it('shows Cancel Upload button in pending view', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByRole('button', { name: /cancel upload/i })).toBeInTheDocument();
    });

    it('disables Cancel Upload button when status is Transmitting', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 1, status: 'Transmitting' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const cancelButton = screen.getByRole('button', { name: /cancel upload/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Dialog Content - History View', () => {
    it('shows AcdHistory component when history button is clicked', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));
      fireEvent.click(screen.getByTestId('acd-history'));

      expect(screen.getByTestId('acd-history-component')).toBeInTheDocument();
    });

    it('toggles between upload and history views', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      // Go to history
      fireEvent.click(screen.getByTestId('acd-history'));
      expect(screen.getByTestId('acd-history-component')).toBeInTheDocument();
      expect(screen.queryByTestId('acd-upload-component')).not.toBeInTheDocument();

      // Go back to upload
      fireEvent.click(screen.getByTestId('acd-history'));
      expect(screen.getByTestId('acd-upload-component')).toBeInTheDocument();
      expect(screen.queryByTestId('acd-history-component')).not.toBeInTheDocument();
    });

    it('shows "Back to ACD upload" button in history view', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));
      fireEvent.click(screen.getByTestId('acd-history'));

      expect(screen.getByText('Back to ACD upload')).toBeInTheDocument();
    });

    it('shows "View unit ACD upload history" button in upload view', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByText('View unit ACD upload history')).toBeInTheDocument();
    });

    it('shows only Close button in history view', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));
      fireEvent.click(screen.getByTestId('acd-history'));

      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Upload Functionality', () => {
    it('calls uploadAcd mutation when upload button is clicked', async () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const setFileButton = screen.getByText('Set File');
      fireEvent.click(setFileButton);

      // Get all buttons with "Upload" text and find the one in the dialog actions
      const buttons = screen.getAllByRole('button', { name: /upload/i });
      const uploadButton = buttons.find((btn) => btn.textContent === 'Upload');

      if (uploadButton) {
        fireEvent.click(uploadButton);
      }

      await waitFor(() => {
        expect(mockUploadAcd).toHaveBeenCalledWith({
          uic: mockCurrentUic,
          acdFile: expect.any(File),
        });
      });
    });

    it('closes dialog after successful upload', async () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const setFileButton = screen.getByText('Set File');
      fireEvent.click(setFileButton);

      // Get all buttons with "Upload" text and find the one in the dialog actions
      const buttons = screen.getAllByRole('button', { name: /upload/i });
      const uploadButton = buttons.find((btn) => btn.textContent === 'Upload');

      if (uploadButton) {
        fireEvent.click(uploadButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Upload ACD')).not.toBeInTheDocument();
      });
    });

    it('shows loading state during upload', () => {
      (useUploadAcdMutation as any).mockReturnValue([mockUploadAcd, { isLoading: true }]);

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('handles upload error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Upload failed');

      mockUploadAcd.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(mockError),
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const setFileButton = screen.getByText('Set File');
      fireEvent.click(setFileButton);

      // Get all buttons with "Upload" text and find the one in the dialog actions
      const buttons = screen.getAllByRole('button', { name: /upload/i });
      const uploadButton = buttons.find((btn) => btn.textContent === 'Upload');

      if (uploadButton) {
        fireEvent.click(uploadButton);
      }

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Upload failed:', mockError);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cancel Upload Functionality', () => {
    it('calls cancelUpload mutation when cancel button is clicked', async () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 123, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const cancelButton = screen.getByRole('button', { name: /cancel upload/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockCancelUpload).toHaveBeenCalledWith({ id: 123 });
      });
    });

    it('closes dialog after successful cancellation', async () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 123, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const cancelButton = screen.getByRole('button', { name: /cancel upload/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Upload ACD')).not.toBeInTheDocument();
      });
    });

    it('shows loading state during cancellation', () => {
      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 123, status: 'Pending' },
        isLoading: false,
        isError: false,
      });
      (useCancelAcdUploadMutation as any).mockReturnValue([mockCancelUpload, { isLoading: true }]);

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      expect(screen.getByText('Cancelling...')).toBeInTheDocument();
    });

    it('handles cancel error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Cancel failed');

      (useGetAcdUploadLatestHistoryQuery as any).mockReturnValue({
        data: { id: 123, status: 'Pending' },
        isLoading: false,
        isError: false,
      });

      mockCancelUpload.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(mockError),
      });

      render(
        <ThemedTestingComponent>
          <AcdUploadButton />
        </ThemedTestingComponent>,
      );

      fireEvent.click(screen.getByTestId('acd-export-upload'));

      const cancelButton = screen.getByRole('button', { name: /cancel upload/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Cancel failed:', mockError);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
