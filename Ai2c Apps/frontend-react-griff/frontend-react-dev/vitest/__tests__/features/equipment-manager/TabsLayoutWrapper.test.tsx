import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EquipmentManagerProvider } from '@features/equipment-manager/EquipmentManagerContext';
import TabsLayoutWrapper from '@features/equipment-manager/TabsLayoutWrapper';

import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { mockFilteredUnits } from '@vitest/mocks/griffin_api_handlers/equipment/mock_data';

const testChildRoutes: RouteObject[] = [
  {
    label: 'Overview',
    path: '',
    element: <div>Overview Page</div>,
  },
  {
    label: 'Test1',
    path: 'test1',
    element: <div>Test 1 Page</div>,
  },
  {
    label: 'Test2',
    path: 'test2',
    element: <div>Test 2 Page</div>,
  },
];

const renderWithRouter = (initialPath: string = '/', childrenRoutes: RouteObject[]) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        label: 'Test Tabs',
        element: (
          <EquipmentManagerProvider>
            <TabsLayoutWrapper title={'Test Tabs Wrapper'} routes={childrenRoutes} />
          </EquipmentManagerProvider>
        ),
        children: childrenRoutes,
      },
    ],
    { initialEntries: ['/', initialPath], initialIndex: 1 },
  );

  return render(<RouterProvider router={router} />);
};

vi.mock('@components/dropdowns/UnitSelect', () => ({
  UnitSelect: vi.fn(() => <div data-testid="unit-select">Unit Select</div>),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/auto_dsr/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetUnitsQuery: vi.fn(),
  };
});

describe('TabsLayoutWrapper', () => {
  beforeEach(() => (window.HTMLElement.prototype.scroll = function () {}));
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetUnitsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFilteredUnits,
      isLoading: false,
    });
    renderWithRouter('', testChildRoutes);
  });

  it('test TabsLayoutWrapper renders correctly', async () => {
    const layout = await screen.findByTestId('test-tabs-wrapper-section');
    expect(layout).toBeInTheDocument();

    expect(screen.getByText('See equipment in a unit underneath your global unit.')).toBeInTheDocument();
  });

  it('test TabsLayoutWrapper units dispatches', async () => {
    const tabTest1 = await screen.findByRole('tab', { name: /test1/i });
    const tabTest2 = await screen.findByRole('tab', { name: /test2/i });
    expect(tabTest1).toBeInTheDocument();
    expect(tabTest2).toBeInTheDocument();

    await userEvent.click(tabTest1);

    expect(screen.queryByTestId('tab-panel-test1')).toBeInTheDocument(); // expects tab1 to be active
    expect(screen.queryByTestId('tab-panel-test2')).not.toBeInTheDocument(); // expects tab2 to not be active

    // vice-versa
    await userEvent.click(tabTest2);

    expect(screen.queryByTestId('tab-panel-test1')).not.toBeInTheDocument(); // expects tab1 to not be active
    expect(screen.queryByTestId('tab-panel-test2')).toBeInTheDocument(); // expects tab2 to be active
  });

  it('test a unit select', async () => {
    expect(screen.getByTestId('unit-select')).toBeInTheDocument();
  });
});
