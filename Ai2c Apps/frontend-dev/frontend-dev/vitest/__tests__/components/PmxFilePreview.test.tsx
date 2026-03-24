import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import PmxFilePreview from '@components/PmxFilePreview';

describe('FilePreview Component', () => {
  it('renders an iframe when given a PDF file', () => {
    render(<PmxFilePreview fileName="document.pdf" filePath="/files/document.pdf" />);

    const iframeElement = screen.getByTitle('Preview of document.pdf');
    expect(iframeElement).toBeInTheDocument();
    expect(iframeElement.tagName).toBe('IFRAME');
  });

  it('renders text for only pdfs when given a non-PDF file', () => {
    render(<PmxFilePreview fileName="image.png" filePath="/files/image.png" />);

    const nonPdfText = screen.getByText('Only PDFs can be previewed');

    expect(nonPdfText).toBeInTheDocument();
  });
  it('renders preview unavailable when no path is given', () => {
    render(<PmxFilePreview fileName="image.png" filePath={null} />);

    const noPreviewElement = screen.getByText('Preview unavailable');

    expect(noPreviewElement).toBeInTheDocument();
  });
});
