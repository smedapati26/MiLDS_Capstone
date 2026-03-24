import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen } from '@testing-library/react';

import { PmxStatusCountBar } from '@components/index';
import { PmxStatusCountBarProps } from '@components/PmxStatusCountBar';

const mockPmxStatusCountBarProps: PmxStatusCountBarProps = {
    data: [
        {
            color: 'white',
            count: 1,
            title: 'Section 1'
        },
        {
            color: 'red',
            count: 2,
            title: 'Section 2'
        }
    ],
    total: 3
}

describe('Dashboard Tests', () => {
  it('renders correctly', () => {
    renderWithProviders(<PmxStatusCountBar {...mockPmxStatusCountBarProps}/>);

    const sectionOneBox = screen.getByLabelText('Section 1-display-bar')
    const sectionTwoBox = screen.getByLabelText('Section 2-display-bar')

    expect(sectionOneBox).toBeInTheDocument();
    expect(sectionTwoBox).toBeInTheDocument();
  });
});
