import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers/renderWithProviders';

import { fireEvent, screen } from '@testing-library/react';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

// Mock the dependencies
vi.mock('@utils/helpers', () => ({
  generateTestId: vi.fn((label, suffix) => `${label?.toLowerCase().replace(/\s+/g, '-')}-${suffix}`),
}));

vi.mock('@components/PmxErrorDisplay', () => ({
  PmxErrorDisplay: ({ onRefresh }: { onRefresh?: () => void }) => (
    <div data-testid="pmx-error-display">
      <div>Issues loading data. Try refreshing, or contact support if the issue persists.</div>
      {onRefresh && (
        <button onClick={onRefresh} data-testid="refresh-button">
          Refresh
        </button>
      )}
      <button data-testid="contact-button">Contact</button>
    </div>
  ),
}));

vi.mock('@components/inputs/PmxLaunchHeading', () => ({
  PmxLaunchHeading: ({ heading, path }: { heading?: string; path?: string }) => (
    <div data-testid="pmx-launch-heading">
      {heading && <h6 className="MuiTypography-h6">{heading}</h6>}
      {path && (
        <button data-testid="pmx-launch-button" data-path={path}>
          Launch
        </button>
      )}
    </div>
  ),
}));

describe('PmxGridItemTemplate', () => {
  const defaultProps = {
    label: 'Test Component',
    children: <div data-testid="test-children">Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('renders skeleton when isUninitialized is true', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-testid', 'test-component-skeleton-loading');
    });

    it('renders skeleton when isFetching is true', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isFetching={true} />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders skeleton when both isUninitialized and isFetching are true', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} isFetching={true} />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders skeleton with default minHeight when minHeight is not provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
      // The skeleton should have the default minHeight applied via sx prop
    });

    it('renders skeleton with custom minHeight when provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} minHeight="200px" />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders skeleton with correct Material-UI props', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isFetching={true} />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('MuiSkeleton-root');
      expect(skeleton).toHaveClass('MuiSkeleton-rectangular');
    });
  });

  describe('Error State', () => {
    it('renders error display when isError is true', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isError={true} />);

      expect(screen.getByTestId('pmx-error-display')).toBeInTheDocument();
      expect(
        screen.getByText('Issues loading data. Try refreshing, or contact support if the issue persists.'),
      ).toBeInTheDocument();
    });

    it('renders error state with hardcoded label "Failed to Load Data"', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isError={true} />);

      // The error state should show the hardcoded label, not the passed label
      expect(screen.getByText('Failed to Load Data')).toBeInTheDocument();
      expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    });

    it('passes refetch function to PmxErrorDisplay when provided', () => {
      const mockRefetch = vi.fn();
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isError={true} refetch={mockRefetch} />);

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('renders error state without refresh button when refetch is not provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isError={true} />);

      expect(screen.getByTestId('pmx-error-display')).toBeInTheDocument();
      expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument();
    });

    it('renders contact button in error state', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isError={true} />);

      expect(screen.getByTestId('contact-button')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('renders children when no error or loading states are active', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders label in success state', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('renders without label when label is not provided', () => {
      renderWithProviders(
        <PmxGridItemTemplate>
          <div data-testid="test-children">Test Content</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    });

    it('renders launch button when launchPath is provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} launchPath="/test-path" />);

      const launchButton = screen.getByTestId('pmx-launch-button');
      expect(launchButton).toBeInTheDocument();
      expect(launchButton).toHaveAttribute('data-path', '/test-path');
    });

    it('does not render launch button when launchPath is not provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      expect(screen.queryByTestId('pmx-launch-button')).not.toBeInTheDocument();
    });

    it('renders both label and launch button when both are provided', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} launchPath="/test-path" />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
      expect(screen.getByTestId('pmx-launch-button')).toBeInTheDocument();
    });
  });

  describe('State Priority', () => {
    it('prioritizes loading state over error state', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} isError={true} />);

      expect(screen.getByTestId('test-component-skeleton-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('pmx-error-display')).not.toBeInTheDocument();
    });

    it('prioritizes fetching state over error state', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isFetching={true} isError={true} />);

      expect(screen.getByTestId('test-component-skeleton-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('pmx-error-display')).not.toBeInTheDocument();
    });

    it('shows error state when loading states are false', () => {
      renderWithProviders(
        <PmxGridItemTemplate {...defaultProps} isUninitialized={false} isFetching={false} isError={true} />,
      );

      expect(screen.queryByTestId('test-component-skeleton-loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('pmx-error-display')).toBeInTheDocument();
    });

    it('shows success state when all other states are false', () => {
      renderWithProviders(
        <PmxGridItemTemplate {...defaultProps} isUninitialized={false} isFetching={false} isError={false} />,
      );

      expect(screen.queryByTestId('test-component-skeleton-loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pmx-error-display')).not.toBeInTheDocument();
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('renders with proper container structure in success state', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      const container = screen.getByTestId('test-component-grid-item');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('MuiContainer-root');
    });

    it('applies correct container props', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      const container = screen.getByTestId('test-component-grid-item');
      expect(container).toHaveClass('MuiContainer-disableGutters');
    });

    it('renders Stack component for header layout', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} launchPath="/test" />);

      // Both label and launch button should be present, indicating Stack is working
      expect(screen.getByText('Test Component')).toBeInTheDocument();
      expect(screen.getByTestId('pmx-launch-button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined label gracefully', () => {
      renderWithProviders(
        <PmxGridItemTemplate label={undefined}>
          <div data-testid="test-children">Test Content</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('handles empty string label', () => {
      renderWithProviders(
        <PmxGridItemTemplate label="">
          <div data-testid="test-children">Test Content</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithProviders(<PmxGridItemTemplate label="Test" />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByTestId('test-grid-item')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      renderWithProviders(
        <PmxGridItemTemplate label="Test">
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('handles minHeight with different units', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} minHeight="50vh" />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
    });

    it('handles zero minHeight', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} isUninitialized={true} minHeight="0px" />);

      const skeleton = screen.getByTestId('test-component-skeleton-loading');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('maintains state through re-renders', () => {
      const { rerender } = renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      expect(screen.getByTestId('test-children')).toBeInTheDocument();

      rerender(<PmxGridItemTemplate {...defaultProps} isFetching={true} />);
      expect(screen.getByTestId('test-component-skeleton-loading')).toBeInTheDocument();

      rerender(<PmxGridItemTemplate {...defaultProps} isError={true} />);
      expect(screen.getByTestId('pmx-error-display')).toBeInTheDocument();
    });

    it('handles prop changes correctly', () => {
      const { rerender } = renderWithProviders(
        <PmxGridItemTemplate label="Original Label">
          <div data-testid="original-content">Original</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByText('Original Label')).toBeInTheDocument();
      expect(screen.getByTestId('original-content')).toBeInTheDocument();

      rerender(
        <PmxGridItemTemplate label="Updated Label">
          <div data-testid="updated-content">Updated</div>
        </PmxGridItemTemplate>,
      );

      expect(screen.getByText('Updated Label')).toBeInTheDocument();
      expect(screen.getByTestId('updated-content')).toBeInTheDocument();
      expect(screen.queryByText('Original Label')).not.toBeInTheDocument();
      expect(screen.queryByTestId('original-content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders label as heading with correct level', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Component');
    });

    it('maintains proper heading hierarchy', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('MuiTypography-h6');
    });

    it('provides proper test ids for testing', () => {
      renderWithProviders(<PmxGridItemTemplate {...defaultProps} />);

      expect(screen.getByTestId('test-component-grid-item')).toBeInTheDocument();
    });
  });
});
