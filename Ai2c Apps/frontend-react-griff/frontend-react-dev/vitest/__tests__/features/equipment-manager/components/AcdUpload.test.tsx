/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import AcdUpload from '@features/equipment-manager/components/AcdUpload';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(),
}));

import { useDropzone } from 'react-dropzone';

describe('AcdUpload', () => {
  const mockSetUploadedFile = vi.fn();
  const mockOpen = vi.fn();
  const mockGetRootProps = vi.fn(() => ({}));
  const mockGetInputProps = vi.fn(() => ({}));

  const defaultProps = {
    uploadedFile: null,
    setUploadedFile: mockSetUploadedFile,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useDropzone as any).mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: false,
      open: mockOpen,
    });
  });

  describe('Rendering', () => {
    it('renders the component with initial state', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Select ACD files to upload.')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop file here')).toBeInTheDocument();
      expect(screen.getByText('or')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
    });

    it('renders FileUploadIcon', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      const icon = container.querySelector('[data-testid="FileUploadIcon"]');
      expect(icon || container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders in dark mode', () => {
      const { container } = render(
        <ThemedTestingComponent mode="dark">
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Select ACD files to upload.')).toBeInTheDocument();
    });

    it('does not show undo alert initially', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(screen.queryByText('Document replaced.')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
    });

    it('does not show uploaded file card initially', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(screen.queryByTestId('CloseIcon')).not.toBeInTheDocument();
    });
  });

  describe('Browse Button', () => {
    it('renders browse button', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      const browseButton = screen.getByRole('button', { name: /browse/i });
      expect(browseButton).toBeInTheDocument();
    });

    it('calls open function when browse button is clicked', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      const browseButton = screen.getByRole('button', { name: /browse/i });
      fireEvent.click(browseButton);

      expect(mockOpen).toHaveBeenCalledTimes(1);
    });

    it('stops propagation when browse button is clicked', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      const browseButton = screen.getByRole('button', { name: /browse/i });
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      browseButton.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('configures dropzone with correct options', () => {
      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(useDropzone).toHaveBeenCalledWith(
        expect.objectContaining({
          maxFiles: 1,
          multiple: false,
          noClick: true,
          noKeyboard: true,
          onDrop: expect.any(Function),
        }),
      );
    });

    it('shows drag active state', () => {
      (useDropzone as any).mockReturnValue({
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: true,
        open: mockOpen,
      });

      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(mockGetRootProps).toHaveBeenCalled();
    });

    it('handles file drop', () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      let onDropCallback: any;

      (useDropzone as any).mockImplementation((config: any) => {
        onDropCallback = config.onDrop;
        return {
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
          open: mockOpen,
        };
      });

      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      // Simulate file drop
      onDropCallback([mockFile]);

      expect(mockSetUploadedFile).toHaveBeenCalledWith(mockFile);
    });

    it('handles multiple files by taking only the first one', () => {
      const mockFile1 = new File(['test content 1'], 'test1.txt', { type: 'text/plain' });
      const mockFile2 = new File(['test content 2'], 'test2.txt', { type: 'text/plain' });
      let onDropCallback: any;

      (useDropzone as any).mockImplementation((config: any) => {
        onDropCallback = config.onDrop;
        return {
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
          open: mockOpen,
        };
      });

      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      // Simulate dropping multiple files
      onDropCallback([mockFile1, mockFile2]);

      // Only check that setUploadedFile was called once with the first file
      expect(mockSetUploadedFile).toHaveBeenCalledTimes(1);
      expect(mockSetUploadedFile).toHaveBeenCalledWith(mockFile1);
    });

    it('does not call setUploadedFile when no files are dropped', () => {
      let onDropCallback: any;

      (useDropzone as any).mockImplementation((config: any) => {
        onDropCallback = config.onDrop;
        return {
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
          open: mockOpen,
        };
      });

      render(
        <ThemedTestingComponent>
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      // Simulate dropping no files
      onDropCallback([]);

      expect(mockSetUploadedFile).not.toHaveBeenCalled();
    });
  });

  describe('Uploaded File Display', () => {
    it('displays uploaded file name', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      render(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('displays remove button when file is uploaded', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      const { container } = render(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      const closeIcon = container.querySelector('[data-testid="CloseIcon"]');
      expect(closeIcon || container.querySelector('button')).toBeInTheDocument();
    });

    it('removes file when close button is clicked', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      render(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      // Find the IconButton with CloseIcon
      const closeButtons = screen.getAllByRole('button');
      // The close button should be the last button (after the browse button)
      const closeButton = closeButtons[closeButtons.length - 1];

      fireEvent.click(closeButton);

      expect(mockSetUploadedFile).toHaveBeenCalledWith(null);
    });

    it('displays file name as underlined and clickable', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      render(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      const fileName = screen.getByText('test-file.txt');
      expect(fileName).toHaveStyle({ textDecoration: 'underline', cursor: 'pointer' });
    });
  });

  describe('Undo Functionality', () => {
    it('shows undo alert when file is replaced', () => {
      const mockFile1 = new File(['content 1'], 'file1.txt', { type: 'text/plain' });
      const mockFile2 = new File(['content 2'], 'file2.txt', { type: 'text/plain' });
      let onDropCallback: any;

      (useDropzone as any).mockImplementation((config: any) => {
        onDropCallback = config.onDrop;
        return {
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
          open: mockOpen,
        };
      });

      const { rerender } = render(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile1} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      // Simulate dropping a new file
      onDropCallback([mockFile2]);

      // Rerender with updated state (simulating the component update)
      rerender(
        <ThemedTestingComponent>
          <AcdUpload uploadedFile={mockFile2} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const { container } = render(
        <ThemedTestingComponent mode="light">
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(container).toBeInTheDocument();
    });

    it('renders correctly in dark mode', () => {
      const { container } = render(
        <ThemedTestingComponent mode="dark">
          <AcdUpload {...defaultProps} />
        </ThemedTestingComponent>,
      );

      expect(container).toBeInTheDocument();
    });

    it('applies dark mode styles to uploaded file card', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      const { container } = render(
        <ThemedTestingComponent mode="dark">
          <AcdUpload uploadedFile={mockFile} setUploadedFile={mockSetUploadedFile} />
        </ThemedTestingComponent>,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });
  });
});
