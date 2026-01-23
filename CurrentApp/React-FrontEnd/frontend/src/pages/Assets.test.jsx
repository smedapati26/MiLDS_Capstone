// src/pages/__tests__/Assets.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Assets from "../Assets";

// API modules used in Assets
import * as aircraftApi from "../../api/aircraft";
import * as personnelApi from "../../api/personnel";
import * as scenariosApi from "../../api/scenarios";
import client from "../../api/client";

// Mock the axios client + API modules
jest.mock("../../api/client");
jest.mock("../../api/aircraft");
jest.mock("../../api/personnel");
jest.mock("../../api/scenarios");

function mockInitialApi() {
  // CSRF bootstrap
  client.get.mockImplementation((url) => {
    if (url === "/api/csrf/") {
      return Promise.resolve({ data: { ok: true } });
    }
    // Scenario apply call is handled separately in a specific test
    return Promise.resolve({ data: {} });
  });

  // listAircraft / listPersonnel / listScenarios return promises
  aircraftApi.listAircraft.mockResolvedValue([
    {
      pk: 1,
      aircraft_pk: 1001,
      model_name: "UH-60M",
      status: "FMC",
      current_unit: "WDDRA0",
      hours_to_phase: 25,
    },
    {
      pk: 2,
      aircraft_pk: 1002,
      model_name: "CH-47F",
      status: "NMC",
      current_unit: "WDDRA0",
      hours_to_phase: 10,
    },
  ]);

  personnelApi.listPersonnel.mockResolvedValue([
    {
      user_id: "123456789012",
      first_name: "Jane",
      last_name: "Doe",
      rank: "CPT",
      primary_mos: "17A",
      current_unit: "75 RR",
      is_maintainer: false,
    },
  ]);

  scenariosApi.listScenarios.mockResolvedValue([
    {
      id: 42,
      name: "Night Maintenance Surge",
      description: "Test scenario",
      created_at: new Date().toISOString(),
      event_count: 3,
    },
  ]);
}

describe("Assets page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitialApi();
  });

  test("shows API connected status and renders aircraft rows", async () => {
    render(<Assets />);

    // Wait for aircraft to load and status chip to appear
    await waitFor(() =>
      expect(
        screen.getByText(/API connected · 2 aircraft/i)
      ).toBeInTheDocument()
    );

    // Check the table rows contain our aircraft
    expect(screen.getByText("UH-60M")).toBeInTheDocument();
    expect(screen.getByText("CH-47F")).toBeInTheDocument();
  });

  test("filters aircraft table based on search input", async () => {
    render(<Assets />);

    await waitFor(() =>
      expect(screen.getByText("UH-60M")).toBeInTheDocument()
    );

    const search = screen.getByPlaceholderText(/Search tail, type, unit/i);

    // Filter for NMC aircraft
    fireEvent.change(search, { target: { value: "NMC" } });

    // Only the NMC aircraft should appear
    await waitFor(() => {
      expect(screen.getByText("CH-47F")).toBeInTheDocument();
      expect(screen.queryByText("UH-60M")).not.toBeInTheDocument();
    });
  });

  test("shows scenarios and calls backend when Apply is clicked", async () => {
    // For this test, let client.get handle scenario run calls explicitly
    client.get.mockImplementation((url) => {
      if (url === "/api/csrf/") {
        return Promise.resolve({ data: { ok: true } });
      }
      if (url === "/scenarios/42/run/") {
        // Simulate backend successfully running scenario
        return Promise.resolve({ data: { ok: true } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Assets />);

    // Switch to the Custom Scenarios tab
    const scenariosTab = screen.getByRole("tab", {
      name: /Custom Scenarios/i,
    });
    fireEvent.click(scenariosTab);

    // Wait for scenario row to render
    await waitFor(() =>
      expect(
        screen.getByText(/Night Maintenance Surge/i)
      ).toBeInTheDocument()
    );

    const applyButton = screen.getByRole("button", { name: /Apply/i });
    fireEvent.click(applyButton);

    // Button should show 'Applying…' while in progress
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Applying…/i })
      ).toBeInTheDocument()
    );

    // Ensure the scenario run endpoint was called
    await waitFor(() =>
      expect(client.get).toHaveBeenCalledWith("/scenarios/42/run/")
    );
  });
});
