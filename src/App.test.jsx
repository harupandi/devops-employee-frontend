import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import App from "./App";

const mockEmployees = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    department: "Engineering",
    role: "Software Engineer",
    email: "john.doe@example.com",
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    department: "Finance",
    role: "Financial Analyst",
    email: "jane.smith@example.com",
  },
];

function mockSuccessfulResponse(page = 1) {
  return {
    ok: true,
    json: async () => ({
      data: mockEmployees,
      pagination: {
        total: 20,
        total_pages: 2,
        page,
        limit: 10,
      },
    }),
  };
}

describe("Employee Directory", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state while employees are being fetched", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    render(<App />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("loads and displays employees", async () => {
    fetch.mockResolvedValueOnce(mockSuccessfulResponse());

    render(<App />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Financial Analyst")).toBeInTheDocument();

    expect(
      screen.getByText("Showing 2 of 20 employees")
    ).toBeInTheDocument();
  });

  it("shows an error when the API request fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<App />);

    expect(
      await screen.findByText(
        "Unable to load employees. Is the Flask API running?"
      )
    ).toBeInTheDocument();
  });

  it("loads the next page when Next is clicked", async () => {
    fetch
      .mockResolvedValueOnce(mockSuccessfulResponse(1))
      .mockResolvedValueOnce(mockSuccessfulResponse(2));

    const user = userEvent.setup();

    render(<App />);

    await screen.findByText("John Doe");

    const nextButton = screen.getByRole("button", {
      name: "Next →",
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("/employees?page=2&limit=10"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });
});