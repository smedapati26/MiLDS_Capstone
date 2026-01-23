// src/pages/__tests__/Home.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Home from "../Home";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

describe("Home page", () => {
  test("renders MiLDS title and Launch button", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("MiLDS")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Launch Application/i })
    ).toBeInTheDocument();
  });
});
