import { describe } from "vitest";
import { RenderHelper } from "vitest/helpers/RenderHelper";

import { fireEvent, screen, waitFor } from "@testing-library/react";

import { MultiAddSoldierFlagDialog } from "@features/soldier-manager/components/dialogs/MultiAddSoldierFlagDialog";


describe('MultiAddSoldierFlagDialog', () => {

    it('No render on close', () => {
        RenderHelper(<MultiAddSoldierFlagDialog open={false} setOpen={() => {}} soldierIds={[]}/>)

        expect(screen.queryByText('Add an availability flag to all selected soldiers.')).not.toBeInTheDocument();
    })
    
    it('Renders inital UI', () => {
        RenderHelper(<MultiAddSoldierFlagDialog open={true} setOpen={() => {}} soldierIds={[]}/>)

        const flag1Title = screen.getByText('Flag 1')
        const flagTypeForm = screen.getByRole('combobox', {name: 'Flag Type'});
        const flagInfoForm = screen.getByRole('combobox', {name: 'Flag Info'})
        const flagMxAvailabilityForm = screen.getByRole('combobox', {name: 'Mx Availability'})
        const startDateForm = screen.getByRole('textbox', {name: 'Start Date'})
        const endDateForm = screen.getByRole('textbox', {name: 'End Date'});
        const noEndDateCheckbox = screen.getByRole('checkbox')
        const remarksForm = screen.getByRole('textbox', {name: 'Remarks'});
        const addButton = screen.getByText('Add another flag')
        const createButton = screen.getByRole('button', {name: 'Add'})
        const cancelButton = screen.getByRole('button', {name: 'Cancel'})

        expect(flag1Title).toBeInTheDocument();
        expect(flagTypeForm).toBeInTheDocument();
        expect(flagInfoForm).toBeInTheDocument();
        // expect(flagInfoForm).toBeDisabled();
        expect(flagMxAvailabilityForm).toBeInTheDocument()
        expect(startDateForm).toBeInTheDocument();
        expect(endDateForm).toBeInTheDocument();
        expect(noEndDateCheckbox).toBeInTheDocument();
        expect(remarksForm).toBeInTheDocument();
        expect(addButton).toBeInTheDocument();
        expect(createButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
    })

    it('Form Functionality', async () => {
        RenderHelper(<MultiAddSoldierFlagDialog open={true} setOpen={() => {}} soldierIds={[]}/>)

        const flag1Title = screen.getByText('Flag 1')
        const flagTypeForm = screen.getByRole('combobox', {name: 'Flag Type'});
        const flagInfoForm = screen.getByRole('combobox', {name: 'Flag Info'})
        const flagMxAvailabilityForm = screen.getByRole('combobox', {name: 'Mx Availability'})
        const startDateForm = screen.getByRole('textbox', {name: 'Start Date'})
        const endDateForm = screen.getByRole('textbox', {name: 'End Date'});
        const noEndDateCheckbox = screen.getByRole('checkbox')
        const remarksForm = screen.getByRole('textbox', {name: 'Remarks'});
        const addButton = screen.getByText('Add another flag')
        const createButton = screen.getByRole('button', {name: 'Add'})
        const cancelButton = screen.getByRole('button', {name: 'Cancel'})

        expect(flag1Title).toBeInTheDocument();
        expect(flagTypeForm).toBeInTheDocument();
        expect(flagInfoForm).toBeInTheDocument();
        // expect(flagInfoForm).toBeDisabled();
        expect(flagMxAvailabilityForm).toBeInTheDocument()
        expect(startDateForm).toBeInTheDocument();
        expect(endDateForm).toBeInTheDocument();
        expect(noEndDateCheckbox).toBeInTheDocument();
        expect(remarksForm).toBeInTheDocument();
        expect(addButton).toBeInTheDocument();
        expect(createButton).toBeInTheDocument();
        expect(createButton).toBeDisabled();
        expect(cancelButton).toBeInTheDocument();

        fireEvent.mouseDown(flagTypeForm)

        await waitFor(() => {
            const flagTypeOption = screen.queryAllByRole('option')[0];

            fireEvent.click(flagTypeOption)

            fireEvent.click(flagTypeForm)

            expect(flagInfoForm).toBeEnabled();
        })

        fireEvent.mouseDown(flagInfoForm)

        await waitFor(() => {
            const flagInfoOption = screen.queryAllByRole('option')[0]

            fireEvent.click(flagInfoOption)

            fireEvent.click(flagInfoForm);
        })

        fireEvent.mouseDown(flagMxAvailabilityForm)

        await waitFor(() => {
            const mxOption = screen.queryAllByRole('option')[0]

            fireEvent.click(mxOption);

            fireEvent.click(flagMxAvailabilityForm);
        })

        fireEvent.change(startDateForm, {target: {value: '01/01/2025'}})

        fireEvent.click(noEndDateCheckbox);

        await waitFor(() => {
            expect(createButton).toBeEnabled();
        })

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Flag 2')).toBeInTheDocument();

            expect(createButton).toBeDisabled();
        })

        fireEvent.click(cancelButton);
    })
})