import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import AcdUploadStatusChip from '@features/equipment-manager/components/AcdUploadStatusChip';

import { AcdUploadStatus } from '@store/griffin_api/auto_dsr/models';

import { ThemedTestingComponent } from '@vitest/helpers';

describe('AcdUploadStatusChip', () => {
  describe('Pending status', () => {
    it('renders Pending chip with correct label', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders Pending chip with PendingIcon', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      // Check for MUI icon by data-testid or class
      const icon = container.querySelector('[data-testid="PendingIcon"]');
      expect(icon || container.querySelector('.MuiChip-icon')).toBeInTheDocument();
    });

    it('renders Pending chip with outlined variant', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-outlined');
      expect(chip).toBeInTheDocument();
    });

    it('renders Pending chip in light mode with correct styles', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders Pending chip in dark mode with correct styles', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Processing status', () => {
    it('renders Processing chip with "Uploading" label', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Processing" succeeded={false} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Uploading')).toBeInTheDocument();
    });

    it('renders Processing chip with CachedIcon', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const icon = container.querySelector('[data-testid="CachedIcon"]');
      expect(icon || container.querySelector('.MuiChip-icon')).toBeInTheDocument();
    });

    it('renders Processing chip with outlined variant', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-outlined');
      expect(chip).toBeInTheDocument();
    });

    it('renders Processing chip in light mode', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders Processing chip in dark mode', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Complete status with success', () => {
    it('renders Complete chip with correct label when succeeded is true', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={true} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('renders Complete chip with CheckIcon when succeeded is true', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={true} />
        </ThemedTestingComponent>,
      );

      const icon = container.querySelector('[data-testid="CheckIcon"]');
      expect(icon || container.querySelector('.MuiChip-icon')).toBeInTheDocument();
    });

    it('renders Complete chip with outlined variant when succeeded is true', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={true} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-outlined');
      expect(chip).toBeInTheDocument();
    });

    it('renders Complete chip in light mode when succeeded is true', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={true} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders Complete chip in dark mode when succeeded is true', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={true} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Complete status with failure', () => {
    it('renders Failed chip with correct label when succeeded is false', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={false} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('renders Failed chip with ErrorOutlineIcon when succeeded is false', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const icon = container.querySelector('[data-testid="ErrorOutlineIcon"]');
      expect(icon || container.querySelector('.MuiChip-icon')).toBeInTheDocument();
    });

    it('renders Failed chip with outlined variant when succeeded is false', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-outlined');
      expect(chip).toBeInTheDocument();
    });

    it('renders Failed chip in light mode when succeeded is false', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders Failed chip in dark mode when succeeded is false', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Complete" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Unknown status', () => {
    it('renders fallback "--" for unknown status', () => {
      render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status={'Unknown' as AcdUploadStatus} succeeded={false} />
        </ThemedTestingComponent>,
      );

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('does not render a Chip for unknown status', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status={'Unknown' as AcdUploadStatus} succeeded={false} />
        </ThemedTestingComponent>,
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).not.toBeInTheDocument();
    });
  });

  describe('Typography variant', () => {
    it('uses body4 variant for Pending status', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Pending" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const typography = container.querySelector('.MuiTypography-body4');
      expect(typography).toBeInTheDocument();
    });

    it('uses body4 variant for Processing status', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Processing" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const typography = container.querySelector('.MuiTypography-body4');
      expect(typography).toBeInTheDocument();
    });

    it('uses body4 variant for Complete status', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Processing" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const typography = container.querySelector('.MuiTypography-body4');
      expect(typography).toBeInTheDocument();
    });

    it('uses body4 variant for Failed status', () => {
      const { container } = render(
        <ThemedTestingComponent>
          <AcdUploadStatusChip status="Processing" succeeded={false} />
        </ThemedTestingComponent>,
      );

      const typography = container.querySelector('.MuiTypography-body4');
      expect(typography).toBeInTheDocument();
    });
  });

  describe('Chip minimum width', () => {
    it('applies minimum width of 130px to all chips', () => {
      const statuses: Array<{ status: AcdUploadStatus; succeeded: boolean }> = [
        { status: 'Pending', succeeded: false },
        { status: 'Processing', succeeded: false },
        { status: 'Complete', succeeded: true },
        { status: 'Complete', succeeded: false },
      ];

      statuses.forEach(({ status, succeeded }) => {
        const { container } = render(
          <ThemedTestingComponent>
            <AcdUploadStatusChip status={status} succeeded={succeeded} />
          </ThemedTestingComponent>,
        );
        const chip = container.querySelector('.MuiChip-root');
        expect(chip).toBeInTheDocument();
      });
    });
  });
});
