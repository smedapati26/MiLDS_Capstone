/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import UCTLDetails from '@features/uctl-manager/components/UCTLDetails';
import { useLazyGetUnitTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@store/amap_ai/tasks/slices/tasksApi', () => ({
  useLazyGetUnitTasksQuery: vi.fn(),
}));

// Mock dropdown so we can detect calls
vi.mock('@components/dropdowns', () => ({
  PmxDropdown: ({ options, value, onChange }: any) => (
    <select data-testid="uctl-dropdown" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

// Mock UCTLTable so we can assert props
vi.mock('../UCTLTable', () => ({
  __esModule: true,
  default: ({ tableProps }: any) => (
    <div data-testid="uctl-table">
      {tableProps.data.map((row: any) => (
        <div key={row.taskNumber}>{row.taskTitle}</div>
      ))}
    </div>
  ),
}));

// Mock StatusDisplay
vi.mock('@features/amtp-packet/components/soldier-info/StatusDisplay', () => ({
  __esModule: true,
  default: () => <span data-testid="status-display" />,
}));

const mockUnit = {
  id: 'A123',
  title: 'Alpha Company',
  metaData: [
    { name: '91B', children: [{ name: '3' }] },
    { name: '15F', children: [{ name: '4' }] },
  ],
};

describe('UCTLDetails', () => {
  const mockFetch = vi.fn();
  const mockOnRefreshHandled = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    // IMPORTANT FIX: fetch must return a Promise
    mockFetch.mockResolvedValue({});

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      { data: null, isFetching: false },
    ]);
  });

  const renderDetails = (props: any = {}) =>
    render(
      <UCTLDetails
        unit={mockUnit}
        mos={null}
        skillLevel={null}
        shouldRefresh={false}
        onRefreshHandled={mockOnRefreshHandled}
        {...props}
      />,
    );

  it('fetches UCTL data on mount', () => {
    renderDetails();

    expect(mockFetch).toHaveBeenCalledWith({ uic: 'A123' });
  });

  it('calls onRefreshHandled after fetch completes', async () => {
    renderDetails();

    await waitFor(() => {
      expect(mockOnRefreshHandled).toHaveBeenCalled();
    });
  });

  it('auto-selects the only UCTL when data.uctls.length === 1', async () => {
    mockFetch.mockResolvedValue({});

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      {
        data: {
          uctls: [
            {
              ictlId: 10,
              ictlTitle: 'Weapons Maintenance',
              datePublished: '2024-01-01',
              status: 'GREEN',
              tasks: [{ taskNumber: 1, taskTitle: 'Clean Rifle' }],
            },
          ],
        },
        isFetching: false,
      },
    ]);

    renderDetails();

    expect(await screen.findByText('Weapons Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Clean Rifle')).toBeInTheDocument();
  });

  it('renders dropdown when multiple UCTLs exist', () => {
    mockFetch.mockResolvedValue({});

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      {
        data: {
          uctls: [
            { ictlId: 1, ictlTitle: 'UCTL A', tasks: [] },
            { ictlId: 2, ictlTitle: 'UCTL B', tasks: [] },
          ],
        },
        isFetching: false,
      },
    ]);

    renderDetails();

    expect(screen.getByTestId('uctl-dropdown')).toBeInTheDocument();
  });

  it('updates selected UCTL when dropdown changes', () => {
    mockFetch.mockResolvedValue({});

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      {
        data: {
          uctls: [
            {
              ictlId: 1,
              ictlTitle: 'UCTL A',
              tasks: [{ taskNumber: 1, taskTitle: 'Task A' }],
            },
            {
              ictlId: 2,
              ictlTitle: 'UCTL B',
              tasks: [{ taskNumber: 2, taskTitle: 'Task B' }],
            },
          ],
        },
        isFetching: false,
      },
    ]);

    renderDetails();

    fireEvent.change(screen.getByTestId('uctl-dropdown'), {
      target: { value: '2' },
    });

    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('renders unit details correctly', () => {
    mockFetch.mockResolvedValue({});

    (useLazyGetUnitTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      {
        data: {
          uctls: [
            {
              ictlId: 10,
              ictlTitle: 'Weapons Maintenance',
              datePublished: '2024-01-01',
              status: 'GREEN',
              tasks: [],
            },
          ],
        },
        isFetching: false,
      },
    ]);

    renderDetails();

    expect(screen.getByText('Weapons Maintenance')).toBeInTheDocument();
    expect(screen.getByText(/Unit:/)).toHaveTextContent(/Unit:/);
    expect(screen.getByText(/MOS:/)).toHaveTextContent(/MOS:/);
    expect(screen.getByText(/SL:/)).toHaveTextContent(/SL:/);
    expect(screen.getByText(/Last Updated on:/)).toHaveTextContent(/Last Updated on:/);
  });
});
