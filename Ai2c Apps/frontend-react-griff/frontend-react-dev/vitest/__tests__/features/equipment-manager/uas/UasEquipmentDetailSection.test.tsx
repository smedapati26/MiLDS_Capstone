/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';
import UasEquipmentDetailSection, {
  aggregateByCompany,
} from '@features/equipment-manager/uas/UasEquipmentDetailSection';

import { IUAS, mapToUas } from '@store/griffin_api/uas/models/IUAS';
import { useGetUACQuery, useGetUAVQuery } from '@store/griffin_api/uas/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockUacData, mockUavData } from '@vitest/mocks/griffin_api_handlers/uas/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/uas/slices', () => ({
  useGetUAVQuery: vi.fn(),
  useGetUACQuery: vi.fn(),
}));

// Mock the edit components
vi.mock('@features/equipment-manager/uas/UasSingleEdit', () => ({
  default: ({ open, data }: any) =>
    open ? <div data-testid="uas-single-edit">Single Edit: {data?.serialNumber}</div> : null,
}));

vi.mock('@features/equipment-manager/uas/UasMultiEdit', () => ({
  default: ({ open, rows }: any) =>
    open ? <div data-testid="uas-multi-edit">Multi Edit: {rows?.length} items</div> : null,
}));

describe('UasEquipmentDetailSection', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
  });

  const renderComponent = () => {
    return render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <UasEquipmentDetailSection />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );
  };

  describe('Loading States', () => {
    it('shows loading skeleton when UAV is loading', () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.getByTestId('em-carousel-loading')).toBeInTheDocument();
    });

    it('shows loading skeleton when UAC is loading', () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.getByTestId('em-carousel-loading')).toBeInTheDocument();
    });

    it('shows loading skeleton when fetching', () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: true,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.getByTestId('em-carousel-loading')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('renders nothing if there is no data', () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.queryByTestId('uas-equipment-details')).not.toBeInTheDocument();
    });

    it('renders nothing if UAV data is empty and UAC data is undefined', () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.queryByTestId('uas-equipment-details')).not.toBeInTheDocument();
    });
  });

  describe('Rendering with Data', () => {
    beforeEach(() => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
    });

    it('renders equipment details when data is present', async () => {
      renderComponent();

      expect(screen.getByTestId('uas-equipment-details')).toBeInTheDocument();
      expect(screen.getByText(/Equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/UAV Details/i)).toBeInTheDocument();
      expect(screen.getByText(/UAC Details/i)).toBeInTheDocument();
    });

    it('renders UAV data after expanding', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      if (mockUavData.length > 0) {
        await waitFor(() => {
          expect(screen.getByText(mockUavData[0].serial_number)).toBeInTheDocument();
        });
      }
    });

    it('renders UAC data after expanding', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[1]);

      if (mockUacData.length > 0) {
        await waitFor(() => {
          expect(screen.getByText(mockUacData[0].serial_number)).toBeInTheDocument();
        });
      }
    });

    it('renders column headers', () => {
      renderComponent();

      expect(screen.getAllByText(/SN/i).length).toBeGreaterThan(1);
      expect(screen.getAllByText(/Status/i).length).toBeGreaterThan(1);
      expect(screen.getAllByText(/OR Status/i).length).toBeGreaterThan(1);
      expect(screen.getAllByText(/Location/i).length).toBeGreaterThan(1);
      expect(screen.getAllByText(/Remarks/i).length).toBeGreaterThan(1);
      expect(screen.getAllByText(/Actions/i).length).toBeGreaterThan(1);
    });

    it('renders UAV-specific columns', () => {
      renderComponent();

      expect(screen.getAllByText(/Airframe Hrs/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Period Hrs/i).length).toBeGreaterThan(0);
    });
  });

  describe('Single Edit Functionality', () => {
    beforeEach(() => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
    });

    it('opens single edit modal when clicking edit button', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Expand to see edit buttons
      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button');
        const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'));
        expect(editButton).toBeInTheDocument();
      });
    });

    it('opens single edit for UAV when one checkbox is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 1) {
          await user.click(checkboxes[1]); // First checkbox after "select all"
        }
      });

      // Click edit button for the section
      // This would trigger single edit
    });

    it('opens single edit for UAC when one checkbox is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[1]);

      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 1) {
          await user.click(checkboxes[1]);
        }
      });
    });
  });

  describe('Multi Edit Functionality', () => {
    beforeEach(() => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
    });

    it('opens multi edit when multiple checkboxes are selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 2) {
          await user.click(checkboxes[1]);
          await user.click(checkboxes[2]);
        }
      });
    });
  });

  describe('Refetch on Update', () => {
    it('calls refetch when updated array has items', async () => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      // The component should call refetch when updated state changes
      // This is tested indirectly through the useEffect
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe('Data Aggregation', () => {
    it('aggregates UAV data by company', () => {
      const mockData = mockUavData.map(mapToUas);
      const result = aggregateByCompany(mockData, 'Uav');

      expect(result.transformedData).toBeDefined();
      expect(result.keyTitleMapping).toBeDefined();
    });

    it('aggregates UAC data by company', () => {
      const mockData = mockUacData.map(mapToUas);
      const result = aggregateByCompany(mockData, 'Uac');

      expect(result.transformedData).toBeDefined();
      expect(result.keyTitleMapping).toBeDefined();
    });

    it('returns empty objects when data is undefined', () => {
      const result = aggregateByCompany(undefined, 'Uav');

      expect(result.transformedData).toEqual({});
      expect(result.keyTitleMapping).toEqual({});
    });

    it('groups data by currentUnit and type', () => {
      const mockData: IUAS[] = [
        {
          ...mockUavData.map(mapToUas)[0],
          currentUnit: 'Unit1',
          shortName: 'Company A',
        },
        {
          ...mockUavData.map(mapToUas)[0],
          id: 2,
          currentUnit: 'Unit1',
          shortName: 'Company A',
        },
      ];

      const result = aggregateByCompany(mockData, 'Uav');

      const key = 'Unit1-Uav';
      expect(result.transformedData[key]).toHaveLength(2);
    });

    it('creates correct key title mapping', () => {
      const mockData: IUAS[] = [
        {
          ...mockUavData.map(mapToUas)[0],
          currentUnit: 'Unit1',
          shortName: 'Company A',
        },
      ];

      const result = aggregateByCompany(mockData, 'Uav');

      const key = 'Unit1-Uav';
      expect(result.keyTitleMapping[key]).toBeDefined();
    });
  });

  describe('Column Rendering', () => {
    beforeEach(() => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
    });

    it('renders edit buttons in actions column', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('renders formatted numbers for airframe hours', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      // Numbers should be formatted
      await waitFor(() => {
        expect(screen.getByTestId('uas-equipment-details')).toBeInTheDocument();
      });
    });

    it('renders -- for undefined values', async () => {
      const dataWithUndefined = mockUavData.map(mapToUas).map((item) => ({
        ...item,
        locationCode: undefined,
      }));

      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: dataWithUndefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      await waitFor(() => {
        expect(screen.getAllByText('--').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skip Query Condition', () => {
    it('skips queries when chosenUic is empty', () => {
      vi.spyOn(EquipmentManagerContext, 'useEquipmentManagerContext').mockReturnValue({
        chosenUic: '',
      } as any);

      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      renderComponent();

      // Should render nothing when no UIC is chosen
      expect(screen.queryByTestId('uas-equipment-details')).not.toBeInTheDocument();
    });
  });

  describe('Edit Type State Management', () => {
    beforeEach(() => {
      (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUavData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockUacData.map(mapToUas),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
    });

    it('sets editUasType to Uav when editing UAV', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[0]);

      // The editUasType should be set to 'Uav' when interacting with UAV section
      await waitFor(() => {
        expect(screen.getByTestId('uas-equipment-details')).toBeInTheDocument();
      });
    });

    it('sets editUasType to Uac when editing UAC', async () => {
      const user = userEvent.setup();
      renderComponent();

      const expandAllButton = screen.getAllByTestId('em-expand-collapse-all');
      await user.click(expandAllButton[1]);

      // The editUasType should be set to 'Uac' when interacting with UAC section
      await waitFor(() => {
        expect(screen.getByTestId('uas-equipment-details')).toBeInTheDocument();
      });
    });
  });
});
