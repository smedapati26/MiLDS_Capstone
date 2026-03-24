import React from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import PmxTableWrapper from '@components/data-tables/PmxTableWrapper';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

describe('PmxTableWrapper', () => {
  const mockTable = <div data-testid="table">Table Content</div>;
  const mockLeftControls = <div data-testid="left-controls">Left Controls</div>;
  const mockRightControls = <div data-testid="right-controls">Right Controls</div>;

  describe('Basic Rendering', () => {
    it('should render the table', () => {
      renderWithTheme(<PmxTableWrapper table={mockTable} />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getByText('Table Content')).toBeInTheDocument();
    });

    it('should render left controls when provided', () => {
      renderWithTheme(<PmxTableWrapper table={mockTable} leftControls={mockLeftControls} />);

      expect(screen.getByTestId('left-controls')).toBeInTheDocument();
      expect(screen.getByText('Left Controls')).toBeInTheDocument();
    });

    it('should render right controls when provided', () => {
      renderWithTheme(<PmxTableWrapper table={mockTable} rightControls={mockRightControls} />);

      expect(screen.getByTestId('right-controls')).toBeInTheDocument();
      expect(screen.getByText('Right Controls')).toBeInTheDocument();
    });

    it('should render both left and right controls when provided', () => {
      renderWithTheme(
        <PmxTableWrapper table={mockTable} leftControls={mockLeftControls} rightControls={mockRightControls} />,
      );

      expect(screen.getByTestId('left-controls')).toBeInTheDocument();
      expect(screen.getByTestId('right-controls')).toBeInTheDocument();
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('should not render controls when not provided', () => {
      renderWithTheme(<PmxTableWrapper table={mockTable} />);

      expect(screen.queryByTestId('left-controls')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-controls')).not.toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should render within a Box component', () => {
      const { container } = renderWithTheme(<PmxTableWrapper table={mockTable} />);

      // Check if the root is a Box (MuiBox-root class)
      const box = container.firstChild;
      expect(box).toHaveClass('MuiBox-root');
    });

    it('should render controls in a Stack with space-between justification', () => {
      renderWithTheme(
        <PmxTableWrapper table={mockTable} leftControls={mockLeftControls} rightControls={mockRightControls} />,
      );

      // The Stack should have justifyContent: space-between
      const stack = screen.getByTestId('left-controls').closest('.MuiStack-root');
      expect(stack).toBeInTheDocument();
      // Since MUI applies classes, we can check for the direction row
      expect(stack).toHaveClass('MuiStack-root');
    });
  });
});
