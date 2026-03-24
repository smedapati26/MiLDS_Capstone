import { describe, expect,it } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ORStatusTooltip } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/ORStatusTooltip';

describe('ORStatusTooltip', () => {
    const mockChild = <div>Test Child</div>;

    describe('Tooltip Visibility', () => {
        it('should render children without tooltip for FMC status', () => {
            render(
                <ORStatusTooltip status="FMC" ecd="2026-02-18" dateDown="2026-02-15">
                    {mockChild}
                </ORStatusTooltip>
            );

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it('should render children without tooltip for unknown status', () => {
            render(
                <ORStatusTooltip status="UNKNOWN" ecd="2026-02-18" dateDown="2026-02-15">
                    {mockChild}
                </ORStatusTooltip>
            );

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it.each([
            ['NMCM'],
            ['NMCS'],
            ['PMCM'],
            ['PMCS'],
            ['DADE']
        ])('should show tooltip for %s status on hover', async (status) => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status={status} ecd="2026-02-25" dateDown="2026-02-18">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });
        });
    });

    describe('Tooltip Content with Dates', () => {
        it('should display both Date Down and ECD when provided', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCM" ecd="2026-02-25" dateDown="2026-02-18">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
                expect(screen.getByText(/Date Down:/)).toBeInTheDocument();
                expect(screen.getByText(/Est. Completion:/)).toBeInTheDocument();
            });
        });

        it('should show "None" when both dates are null', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCS" ecd={null} dateDown={null}>
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });

            const noneElements = screen.getAllByText('None');
            expect(noneElements.length).toBe(2);
        });

        it('should show "None" for Date Down when only ECD is provided', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="PMCM" ecd="2026-02-25" dateDown={null}>
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
                expect(screen.getByText(/Date Down:/)).toBeInTheDocument();
                expect(screen.getByText('None')).toBeInTheDocument();
                expect(screen.getByText(/Feb 25, 2026/)).toBeInTheDocument();
            });
        });

        it('should show "None" for ECD when only Date Down is provided', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="PMCS" ecd={null} dateDown="2026-02-18">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
                expect(screen.getByText(/Est. Completion:/)).toBeInTheDocument();
                expect(screen.getByText('None')).toBeInTheDocument();
                expect(screen.getByText(/Feb 18, 2026/)).toBeInTheDocument();
            });
        });
    });

    describe('Date Formatting', () => {
        it('should format date-only strings correctly (YYYY-MM-DD)', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCM" ecd="2026-02-25" dateDown="2026-02-18">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText(/Feb 18, 2026/)).toBeInTheDocument();
                expect(screen.getByText(/Feb 25, 2026/)).toBeInTheDocument();
            });
        });

        it('should format datetime strings correctly (ISO 8601)', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip
                    status="NMCM"
                    ecd="2026-02-25T14:30:00Z"
                    dateDown="2026-02-18T08:15:00Z"
                >
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                // Should include time when datetime is provided
                expect(screen.getByText(/Feb 18, 2026/)).toBeInTheDocument();
                expect(screen.getByText(/Feb 25, 2026/)).toBeInTheDocument();
            });
        });

        it('should handle invalid date strings gracefully', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCM" ecd="invalid-date" dateDown="also-invalid">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });

            const invalidDateElements = screen.getAllByText('Invalid Date');
            expect(invalidDateElements.length).toBe(2);
        });

        it('should handle undefined dates', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="DADE" ecd={undefined} dateDown={undefined}>
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });

            const noneElements = screen.getAllByText('None');
            expect(noneElements.length).toBe(2);
        });
    });

    describe('Tooltip Behavior', () => {
        it('should show tooltip on hover and hide on unhover', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCM" ecd="2026-02-25" dateDown="2026-02-18">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');

            // Hover to show tooltip
            await user.hover(child);
            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });

            // Unhover to hide tooltip
            await user.unhover(child);
            await waitFor(() => {
                expect(screen.queryByText('Status Details')).not.toBeInTheDocument();
            });
        });

        it('should render child element correctly', () => {
            const customChild = <button>Custom Button</button>;

            render(
                <ORStatusTooltip status="NMCM" ecd="2026-02-25" dateDown="2026-02-18">
                    {customChild}
                </ORStatusTooltip>
            );

            expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string dates', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="NMCM" ecd="" dateDown="">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
            });

            const noneElements = screen.getAllByText('None');
            expect(noneElements.length).toBe(2);
        });

        it('should handle mixed valid and invalid dates', async () => {
            const user = userEvent.setup();

            render(
                <ORStatusTooltip status="PMCM" ecd="2026-02-25" dateDown="invalid">
                    {mockChild}
                </ORStatusTooltip>
            );

            const child = screen.getByText('Test Child');
            await user.hover(child);

            await waitFor(() => {
                expect(screen.getByText('Status Details')).toBeInTheDocument();
                expect(screen.getByText('Invalid Date')).toBeInTheDocument();
                expect(screen.getByText(/Feb 25, 2026/)).toBeInTheDocument();
            });
        });
    });
});