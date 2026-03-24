import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import XMLFileUpload from '@features/amtp-packet/components/maintainer-record/XMLFileUpload';

// Mock child components
vi.mock('@components/PmxAccordion', () => ({
  default: ({ heading, children }: { heading: string | ReactNode; children: ReactNode }) => (
    <div data-testid="pmx-accordion">
      <h2>{heading}</h2>
      <div>{children}</div>
    </div>
  ),
}));

vi.mock('@components/PmxFileUploader', () => ({
  default: ({ attachedFile }: { attachedFile: File | null }) => (
    <div data-testid="pmx-file-uploader">{attachedFile ? `File: ${attachedFile.name}` : 'No file uploaded'}</div>
  ),
}));

describe('XMLFileUpload', () => {
  const mockSetAttachedFile = vi.fn();

  it('renders instructional text and accordion', () => {
    render(<XMLFileUpload attachedFile={null} setAttachedFile={mockSetAttachedFile} />);

    expect(screen.getByText(/select the soldier's da7817 xml file to upload/i)).toBeInTheDocument();

    expect(screen.getByTestId('pmx-accordion')).toBeInTheDocument();
    expect(screen.getByText(/how to convert pdf to xml/i)).toBeInTheDocument();
    expect(screen.getByText(/open the da7817 pdf in adobe acrobat reader/i)).toBeInTheDocument();
  });

  it('renders the file uploader with no file', () => {
    render(<XMLFileUpload attachedFile={null} setAttachedFile={mockSetAttachedFile} />);
    expect(screen.getByTestId('pmx-file-uploader')).toHaveTextContent('No file uploaded');
  });

  it('renders the file uploader with an attached file', () => {
    const file = new File(['dummy'], 'test.xml', { type: 'text/xml' });
    render(<XMLFileUpload attachedFile={file} setAttachedFile={mockSetAttachedFile} />);
    expect(screen.getByTestId('pmx-file-uploader')).toHaveTextContent('File: test.xml');
  });
});
