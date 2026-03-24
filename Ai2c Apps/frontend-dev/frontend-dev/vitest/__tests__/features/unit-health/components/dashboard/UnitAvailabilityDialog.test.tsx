import dayjs from 'dayjs';
import { MemoryRouter } from "react-router-dom"
import { renderWithProviders, ThemedTestingComponent } from "vitest/helpers"

import { screen } from "@testing-library/react"

import { UnitAvailabilityDialog } from "@features/unit-health/components/dashboard/UnitAvailabilityDialog"


describe('Unit Availability Dialog Tests', () => {
    it('does not render when not opened', () => {
        renderWithProviders(<ThemedTestingComponent><MemoryRouter><UnitAvailabilityDialog unitAvailabilityData={{ available: 10, limited: 5, unavailable: 2, total: 17 }} unitUic="TSTUnit" asOfDate={dayjs()} open={false} setOpen={() => { }} /></MemoryRouter></ThemedTestingComponent>)

        const unitAvailabilityDialogElements = screen.queryByLabelText('Unit Availability Dialog');

        expect(unitAvailabilityDialogElements).not.toBeInTheDocument();
    })

    it('renders when opened', () => {
        renderWithProviders(<ThemedTestingComponent><MemoryRouter><UnitAvailabilityDialog unitAvailabilityData={{ available: 10, limited: 5, unavailable: 2, total: 17 }} unitUic="TSTUnit" asOfDate={dayjs()} open={true} setOpen={() => { }} /></MemoryRouter></ThemedTestingComponent>)

        const unitAvailabilityDialogElements = screen.getByLabelText('Unit Availability Dialog');
        const statusCountBarAvailable = screen.getByLabelText('Available-icon-and-title')
        const statusCountBarUnavailable = screen.getByLabelText('Unavailable-icon-and-title')
        const statusCountBarLimited = screen.getByLabelText('Limited Availability-icon-and-title')
        const dataTable = screen.getByLabelText('Table Header and Filters')

        expect(unitAvailabilityDialogElements).toBeInTheDocument();
        expect(statusCountBarAvailable).toBeInTheDocument();
        expect(statusCountBarUnavailable).toBeInTheDocument();
        expect(statusCountBarLimited).toBeInTheDocument();
        expect(dataTable).toBeInTheDocument();
    })
})