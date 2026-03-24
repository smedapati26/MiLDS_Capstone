/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { TaskforceLogoHeadingFormWrapper } from '@features/task-forces/components/TaskforceLogoHeading';

// Mock react-hook-form
const mockGetValues = vi.fn();
const mockSetValue = vi.fn();
vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    getValues: mockGetValues,
    setValue: mockSetValue,
  }),
}));

vi.mock('@store/griffin_api/users/slices', () => ({
  useGetUserQuery: vi.fn(() => ({
    data: { id: 'owner-123', name: 'Test Owner' },
    isSuccess: true,
  })),
}));

// Mock custom hooks
vi.mock('@features/task-forces/hooks/useFormLogoImage', () => ({
  useFormLogoImage: vi.fn(() => 'mock-data-url'),
}));

vi.mock('@store/griffin_api/users/slices', () => ({
  useGetUserQuery: vi.fn(() => ({
    data: { rankAndName: 'Lt. John Doe' },
    isSuccess: true,
  })),
}));

// Mock helpers
vi.mock('@ai2c/pmx-mui/helpers/titlecase', () => ({
  titlecaseAcronym: vi.fn(() => 'TFA'),
}));

// Mock LogoImage component
vi.mock('./LogoImage', () => ({
  LogoImage: ({ dataURL, alt }: any) => <img data-testid="logo-image" src={dataURL} alt={alt} />,
}));

describe('TaskforceLogoHeading', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock form values
    mockGetValues.mockImplementation((key: string) => {
      const mockValues: Record<string, any> = {
        name: 'Test Taskforce',
        shortname: 'TTF',
        echelon: 'Division',
        location: { name: 'Test Location', code: 'TL' },
        tfDateRange: { startDate: '2023-01-01', endDate: '2023-12-31' },
        slogan: 'Test Slogan',
        ownerId: '123',
      };
      return mockValues[key];
    });
  });

  it('renders without crashing', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    expect(screen.getByText('Test Taskforce')).toBeInTheDocument();
  });

  it('displays logo with correct alt text', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    expect(screen.getByTestId('logo-image')).toBeInTheDocument();
  });

  it('displays taskforce details correctly', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    expect(screen.getByText('Test Taskforce')).toBeInTheDocument();
    expect(screen.getByText('TTF')).toBeInTheDocument();
    expect(screen.getByText('Division')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Slogan')).toBeInTheDocument();
  });

  it('displays owner information when API succeeds', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    expect(screen.getByText('Lt. John Doe')).toBeInTheDocument();
    expect(screen.getByText('TL')).toBeInTheDocument();
  });

  it('sets logo value in form when dataURL is available', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    expect(mockSetValue).toHaveBeenCalledWith('logo', 'mock-data-url');
  });

  it('renders vertical pipes as separators', () => {
    render(<TaskforceLogoHeadingFormWrapper />);
    const pipes = screen.getAllByText('|');
    expect(pipes).toHaveLength(4); // Based on the layout: shortname | echelon | location.name, date | owner | location.code, slogan
  });
});
