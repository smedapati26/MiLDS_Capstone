/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { LogoImage } from '@features/task-forces/components/create-stepper/LogoImage';

// Mock the titlecaseAcronym helper
vi.mock('@ai2c/pmx-mui/helpers/titlecase', () => ({
  titlecaseAcronym: vi.fn((str: string) => str.toUpperCase()),
}));

import { titlecaseAcronym } from '@ai2c/pmx-mui/helpers/titlecase';

const mockTitlecaseAcronym = titlecaseAcronym as any;

describe('LogoImage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Avatar with src when dataURL is provided', () => {
    const dataURL = 'data:image/png;base64,test';
    render(<LogoImage dataURL={dataURL} alt="test image" />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', dataURL);
  });

  it('renders alt when no url is provided', () => {
    mockTitlecaseAcronym.mockReturnValue('TI');
    render(<LogoImage dataURL={null} alt="test image" />);
    expect(screen.getByText('TI')).toBeInTheDocument();
  });

  it('renders Avatar with fallback icon when neither dataURL nor name is provided', () => {
    render(<LogoImage dataURL={null} alt="test image" />);

    const avatar = document.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
    expect(avatar).not.toHaveAttribute('src');
  });
});
