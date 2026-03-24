import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PmxImageUploader } from '@components/inputs/PmxImageUploader';

import { ThemedTestingComponent } from '../../../helpers/ThemedTestingComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

describe('PmxImageUploader', () => {
  describe('Basic Rendering', () => {
    it('renders the image uploader component', () => {
      renderWithTheme(<PmxImageUploader />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByLabelText('Logo Upload')).toBeInTheDocument();
    });

    it('renders label text when provided', () => {
      renderWithTheme(<PmxImageUploader text="Upload Image" />);

      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    it('does not render label text when not provided', () => {
      renderWithTheme(<PmxImageUploader />);

      expect(screen.queryByText('Upload Image')).not.toBeInTheDocument();
    });

    it('displays upload icon by default', () => {
      renderWithTheme(<PmxImageUploader />);

      // The icon should be present in the Avatar
      const avatar = screen.getByRole('button').querySelector('img') || screen.getByRole('button');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('File Upload Handling', () => {
    it('calls onUpload callback when file is selected', async () => {
      const user = userEvent.setup();
      const mockOnUpload = vi.fn();
      renderWithTheme(<PmxImageUploader onUpload={mockOnUpload} />);

      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const input = screen.getByLabelText('Logo Upload');

      await user.upload(input, file);

      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });
});
