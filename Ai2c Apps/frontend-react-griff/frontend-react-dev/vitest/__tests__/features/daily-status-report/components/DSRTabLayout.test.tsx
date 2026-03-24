import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { DSRTabLayout } from '@features/daily-status-report/DSRTabLayout';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';

// Mock TabsLayout from @ai2c/pmx-mui to a simple component that displays title and children
vi.mock('@ai2c/pmx-mui', () => {
  return {
    TabsLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div>
        <h1>{title}</h1>
        <div data-testid="tabs-children">{children}</div>
      </div>
    ),
  };
});

// Mock child components if needed
vi.mock('../components/DsrLastUpdated', () => ({
  DsrLastUpdated: () => <div>Last Updated</div>,
}));

vi.mock('../components/ExportReports/ExportReport', () => ({
  default: () => <div>Export Reports</div>,
}));

describe('DSRTabLayout', () => {
  it('renders TabsLayout with correct title and child components', () => {
    render(
      <ProviderWrapper>
        <DSRTabLayout />
      </ProviderWrapper>,
    );
    expect(screen.getByRole('heading', { name: /daily status report/i })).toBeInTheDocument();
    expect(screen.getByText(/Last Updated/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Reports/i)).toBeInTheDocument();
  });
});
