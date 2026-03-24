import React from "react";
import { MemoryRouter } from "react-router-dom";

import SnackbarProvider from "@context/SnackbarProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { renderWithProviders } from "./renderWithProviders";
import { ThemedTestingComponent } from "./ThemedTestingComponent";

export const RenderHelper = (children: React.ReactElement) => {
    return(
        renderWithProviders(
            <ThemedTestingComponent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <SnackbarProvider>
                        <MemoryRouter>
                            {children}
                        </MemoryRouter>
                    </SnackbarProvider>
                </LocalizationProvider>
            </ThemedTestingComponent>
        )
    )
}