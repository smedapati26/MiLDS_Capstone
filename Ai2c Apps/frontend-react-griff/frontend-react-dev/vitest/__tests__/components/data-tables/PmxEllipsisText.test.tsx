import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';

import PmxEllipsisText from '@components/data-tables/PmxEllipsisText';

import '@testing-library/jest-dom';

// Mock theme for consistent testing
const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('PmxEllipsisText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(<PmxEllipsisText text="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders short text without truncation', () => {
      const shortText = 'Short text';
      renderWithTheme(<PmxEllipsisText text={shortText} />);

      expect(screen.getByText(shortText)).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('renders long text with truncation by default', () => {
      const longText =
        'This is a very long text that should be truncated because it exceeds the default maximum length of 100 characters and should show ellipsis';
      renderWithTheme(<PmxEllipsisText text={longText} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement).toBeInTheDocument();
      expect(displayedElement.textContent).toContain('...');
      expect(displayedElement.textContent).not.toBe(longText);
    });
  });

  describe('Text Truncation', () => {
    it('truncates text when it exceeds maxLength', () => {
      const longText = 'This text is longer than 20 characters';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('This text is longer ...');
    });

    it('does not truncate text when it is shorter than maxLength', () => {
      const shortText = 'Short';
      renderWithTheme(<PmxEllipsisText text={shortText} maxLength={20} />);

      expect(screen.getByText('Short')).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('handles edge case when text length equals maxLength', () => {
      const exactText = '12345678901234567890'; // exactly 20 characters
      renderWithTheme(<PmxEllipsisText text={exactText} maxLength={20} />);

      expect(screen.getByText(exactText)).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('handles edge case when text length is maxLength + 1', () => {
      const slightlyLongText = '123456789012345678901'; // 21 characters
      renderWithTheme(<PmxEllipsisText text={slightlyLongText} maxLength={20} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('12345678901234567890...');
    });
  });

  describe('Click Interaction', () => {
    it('expands text when clicked on truncated text', () => {
      const longText = 'This is a very long text that should be truncated initially but can be expanded when clicked';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      // Initially truncated
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

      // Click to expand
      const textElement = screen.getByText(/\.\.\./);
      fireEvent.click(textElement);

      // Should now show full text
      expect(screen.getByText(longText)).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('collapses text when clicked on expanded text', () => {
      const longText = 'This is a very long text that should be truncated initially but can be expanded when clicked';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      const textElement = screen.getByText(/\.\.\./);

      // Click to expand
      fireEvent.click(textElement);
      expect(screen.getByText(longText)).toBeInTheDocument();

      // Click again to collapse
      const expandedElement = screen.getByText(longText);
      fireEvent.click(expandedElement);

      // Should be truncated again
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
      expect(screen.queryByText(longText)).not.toBeInTheDocument();
    });

    it('does not respond to clicks on short text', () => {
      const shortText = 'Short text';
      renderWithTheme(<PmxEllipsisText text={shortText} />);

      const textElement = screen.getByText(shortText);
      fireEvent.click(textElement);

      // Text should remain the same
      expect(screen.getByText(shortText)).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('shows tooltip for truncated text by default', () => {
      const longText = 'This is a very long text that should be truncated and show a tooltip';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      const textElement = screen.getByText(/\.\.\./);
      fireEvent.mouseEnter(textElement);

      // Check for aria-label
      expect(screen.getByLabelText('Click to expand')).toBeInTheDocument();
    });

    it('shows collapse tooltip for expanded text', () => {
      const longText = 'This is a very long text that should be truncated and show a tooltip';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      const textElement = screen.getByText(/\.\.\./);

      // Expand the text first
      fireEvent.click(textElement);

      // Hover over expanded text
      const expandedElement = screen.getByText(longText);
      fireEvent.mouseEnter(expandedElement);

      // Check for aria-label
      expect(screen.getByLabelText('Click to collapse')).toBeInTheDocument();
    });

    it('does not show tooltip when showTooltip is false', () => {
      const longText = 'This is a very long text that should be truncated but not show a tooltip';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} showTooltip={false} />);

      const textElement = screen.getByText(/\.\.\./);
      fireEvent.mouseEnter(textElement);

      expect(screen.queryByLabelText('Click to expand')).not.toBeInTheDocument();
    });

    it('does not show tooltip for short text', () => {
      const shortText = 'Short text';
      renderWithTheme(<PmxEllipsisText text={shortText} showTooltip={true} />);

      const textElement = screen.getByText(shortText);
      fireEvent.mouseEnter(textElement);

      expect(screen.queryByLabelText('Click to expand')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Click to collapse')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('uses default maxLength of 100 when not provided', () => {
      const text = 'a'.repeat(150); // 150 characters
      renderWithTheme(<PmxEllipsisText text={text} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('a'.repeat(100) + '...');
    });

    it('accepts custom maxLength values', () => {
      const text = 'This is a test text';
      renderWithTheme(<PmxEllipsisText text={text} maxLength={10} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('This is a ...');
    });

    it('accepts showTooltip false', () => {
      const longText = 'This is a very long text that should be truncated';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} showTooltip={false} />);

      const textElement = screen.getByText(/\.\.\./);
      fireEvent.mouseEnter(textElement);

      expect(screen.queryByLabelText('Click to expand')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      const { container } = renderWithTheme(<PmxEllipsisText text="" />);

      // Should render empty content
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('handles single character text', () => {
      renderWithTheme(<PmxEllipsisText text="A" />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('handles maxLength of 0', () => {
      renderWithTheme(<PmxEllipsisText text="Any text" maxLength={0} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('...');
    });

    it('handles maxLength of 1', () => {
      renderWithTheme(<PmxEllipsisText text="Hello" maxLength={1} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('H...');
    });

    it('handles very large maxLength', () => {
      const text = 'Short text';
      renderWithTheme(<PmxEllipsisText text={text} maxLength={1000} />);

      expect(screen.getByText(text)).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('handles text with special characters', () => {
      const specialText = 'Hello! @#$%^&*()_+ 🎉 世界';
      renderWithTheme(<PmxEllipsisText text={specialText} maxLength={10} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('Hello! @#$...');
    });

    it('handles text with line breaks', () => {
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';
      renderWithTheme(<PmxEllipsisText text={textWithBreaks} maxLength={10} />);

      const displayedElement = screen.getByText(/\.\.\./);
      expect(displayedElement.textContent).toBe('Line 1\nLin...');
    });
  });

  describe('Component Structure', () => {
    it('renders Typography component with correct variant', () => {
      renderWithTheme(<PmxEllipsisText text="Test text" />);

      const typography = screen.getByText('Test text');
      expect(typography.tagName).toBe('SPAN');
    });

    it('renders with tooltip structure when enabled', () => {
      const longText = 'This is a very long text that should be truncated';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      const textElement = screen.getByText(/\.\.\./);
      expect(textElement).toBeInTheDocument();

      // Check for tooltip trigger
      fireEvent.mouseEnter(textElement);
      expect(screen.getByLabelText('Click to expand')).toBeInTheDocument();
    });

    it('renders without tooltip when disabled', () => {
      const longText = 'This is a very long text that should be truncated';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} showTooltip={false} />);

      const textElement = screen.getByText(/\.\.\./);
      expect(textElement).toBeInTheDocument();

      // Should not have tooltip
      fireEvent.mouseEnter(textElement);
      expect(screen.queryByLabelText('Click to expand')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('maintains truncated state correctly', () => {
      const longText = 'This is a very long text that should be truncated';
      renderWithTheme(<PmxEllipsisText text={longText} maxLength={20} />);

      // Initially truncated
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

      // Expand
      fireEvent.click(screen.getByText(/\.\.\./));
      expect(screen.getByText(longText)).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText(longText));
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });
  });
});
