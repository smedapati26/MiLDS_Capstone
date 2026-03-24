import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { OrStatusTableCell } from '@components/data-tables/OrStatusTableCell';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

// Mock the useDataDisplayTagColor hook
vi.mock('@hooks/useDataDisplayTagColor', () => ({
  default: vi.fn((status: string) => {
    // Return different colors based on status for testing
    const colorMap: Record<string, { color: string; backgroundColor: string }> = {
      FMC: { color: '#ffffff', backgroundColor: '#4caf50' }, // Green
      MTF: { color: '#ffffff', backgroundColor: '#4caf50' }, // Green (same as FMC)
      PMCS: { color: '#ffffff', backgroundColor: '#ff9800' }, // Orange
      PMCM: { color: '#ffffff', backgroundColor: '#ff9800' }, // Orange
      PMC: { color: '#ffffff', backgroundColor: '#ff9800' }, // Orange
      NMCM: { color: '#ffffff', backgroundColor: '#f44336' }, // Red
      NMCS: { color: '#ffffff', backgroundColor: '#f44336' }, // Red
      NMC: { color: '#ffffff', backgroundColor: '#f44336' }, // Red
      MOC: { color: '#ffffff', backgroundColor: '#f44336' }, // Red (same as NMC)
      SUST: { color: '#ffffff', backgroundColor: '#f44336' }, // Red
      FIELD: { color: '#ffffff', backgroundColor: '#f44336' }, // Red
      DADE: { color: '#ffffff', backgroundColor: '#795548' }, // Brown
      UNK: { color: '#ffffff', backgroundColor: '#757575' }, // Grey
    };

    return colorMap[status] || { color: '#ffffff', backgroundColor: '#757575' };
  }),
}));

describe('OrStatusTableCell', () => {
  describe('Basic Rendering', () => {
    it('renders with FMC status and no down date count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.FMC} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('FMC')).toBeInTheDocument();
    });

    it('renders with PMCS status with down date count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.PMCS} downDateCount={5} />
        </ThemedTestingComponent>,
      );

      // PMCS now shows down date count
      expect(screen.getByText('PMCS | 5')).toBeInTheDocument();
    });

    it('renders with string status instead of enum', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status="CUSTOM_STATUS" downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('CUSTOM_STATUS')).toBeInTheDocument();
    });
  });

  describe('Raw Status Display', () => {
    it('displays NMC status as-is', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMC} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMC')).toBeInTheDocument();
    });

    it('displays SUST status as-is without count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.SUST} downDateCount={3} />
        </ThemedTestingComponent>,
      );

      // SUST doesn't show down date count
      expect(screen.getByText('SUST')).toBeInTheDocument();
      expect(screen.queryByText('SUST | 3')).not.toBeInTheDocument();
    });

    it('displays FIELD status as-is without count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.FIELD} downDateCount={7} />
        </ThemedTestingComponent>,
      );

      // FIELD doesn't show down date count
      expect(screen.getByText('FIELD')).toBeInTheDocument();
      expect(screen.queryByText('FIELD | 7')).not.toBeInTheDocument();
    });

    it('keeps NMCM status as NMCM and shows count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} downDateCount={2} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCM | 2')).toBeInTheDocument();
    });

    it('keeps NMCS status as NMCS and shows count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCS} downDateCount={4} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCS | 4')).toBeInTheDocument();
    });

    it('displays PMC status as-is', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.PMC} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('PMC')).toBeInTheDocument();
    });
  });

  describe('Down Date Count Display', () => {
    it('displays status only when down date count is 0', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.PMCM} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('PMCM')).toBeInTheDocument();
      expect(screen.queryByText('PMCM | 0')).not.toBeInTheDocument();
    });

    it('displays PMCM status with count when down date count is greater than 0', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.PMCM} downDateCount={5} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('PMCM | 5')).toBeInTheDocument();
    });

    it('displays PMCS status with count when down date count is greater than 0', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.PMCS} downDateCount={8} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('PMCS | 8')).toBeInTheDocument();
    });

    it('displays NMCS status with count when down date count is greater than 0', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCS} downDateCount={15} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCS | 15')).toBeInTheDocument();
    });

    it('does not display count for FMC status even with positive count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.FMC} downDateCount={15} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('FMC')).toBeInTheDocument();
      expect(screen.queryByText('FMC | 15')).not.toBeInTheDocument();
    });

    it('displays count for DADE status with positive count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.DADE} downDateCount={15} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('DADE | 15')).toBeInTheDocument();
    });

    it('displays count for MOC status with positive count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.MOC} downDateCount={10} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('MOC | 10')).toBeInTheDocument();
    });

    it('handles large down date counts for NMCM', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} downDateCount={365} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCM | 365')).toBeInTheDocument();
    });

    it('handles single digit down date counts for NMCM', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} downDateCount={1} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCM | 1')).toBeInTheDocument();
    });
  });

  describe('All Status Types', () => {
    const statusTestCases = [
      { status: OperationalReadinessStatusEnum.FMC, expected: 'FMC' },
      { status: OperationalReadinessStatusEnum.PMCS, expected: 'PMCS' },
      { status: OperationalReadinessStatusEnum.PMCM, expected: 'PMCM' },
      { status: OperationalReadinessStatusEnum.NMCS, expected: 'NMCS' },
      { status: OperationalReadinessStatusEnum.NMCM, expected: 'NMCM' },
      { status: OperationalReadinessStatusEnum.DADE, expected: 'DADE' },
      { status: OperationalReadinessStatusEnum.MTF, expected: 'MTF' },
      { status: OperationalReadinessStatusEnum.MOC, expected: 'MOC' },
      { status: OperationalReadinessStatusEnum.UNK, expected: 'UNK' },
    ];

    statusTestCases.forEach(({ status, expected }) => {
      it(`renders ${status} status correctly`, () => {
        render(
          <ThemedTestingComponent>
            <OrStatusTableCell status={status} downDateCount={0} />
          </ThemedTestingComponent>,
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure and Styling', () => {
    it('renders as a Box component with proper structure', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.FMC} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      // Check that the component renders as a div (Box component)
      const boxElement = container.querySelector('div');
      expect(boxElement).toBeInTheDocument();
      expect(boxElement).toHaveTextContent('FMC');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative down date count for NMCM', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} downDateCount={-1} />
        </ThemedTestingComponent>,
      );

      // Should treat negative as falsy and not show count
      expect(screen.getByText('NMCM')).toBeInTheDocument();
      expect(screen.queryByText('NMCM | -1')).not.toBeInTheDocument();
    });

    it('handles very large down date count for NMCS', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCS} downDateCount={9999} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCS | 9999')).toBeInTheDocument();
    });

    it('handles undefined-like string status without count', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status="undefined" downDateCount={5} />
        </ThemedTestingComponent>,
      );

      // Should display the string as-is
      expect(screen.getByText('undefined')).toBeInTheDocument();
      expect(screen.queryByText('undefined | 5')).not.toBeInTheDocument();
    });

    it('handles zero down date count for NMCM', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} downDateCount={0} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCM')).toBeInTheDocument();
      expect(screen.queryByText('NMCM | 0')).not.toBeInTheDocument();
    });

    it('handles undefined down date count for NMCM', () => {
      render(
        <ThemedTestingComponent>
          <OrStatusTableCell status={OperationalReadinessStatusEnum.NMCM} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('NMCM')).toBeInTheDocument();
    });
  });
});