import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { PmxCommentTooltip } from '@components/data-tables';

describe('PmxCommentTooltip', () => {
  it('should render the comment icon with tooltip', () => {
    render(<PmxCommentTooltip title="Comment Tooltip" />);
    const icon = screen.getByTestId('comment-tooltip');
    expect(icon).toBeInTheDocument();
    expect(screen.getByLabelText('Comment Tooltip')).toBeInTheDocument();
  });
});
