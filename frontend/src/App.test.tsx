import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const internal = {
  fullAddress: "10 Example St, Carlton VIC 3053",
  lotPlan: { lot: "12", plan: "PS123456" },
  volumeFolio: { volume: null, folio: null },
  status: "UnknownVolFol",
  sourceTrace: {
    provider: "VIC-DDP",
    requestId: "REQ-12345",
    receivedAt: "2025-08-30T03:12:45Z",
  },
};

beforeEach(() => {
  // Mock both possible flows
  global.fetch = jest.fn().mockImplementation((input: RequestInfo) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.endsWith("/api/property")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 1, data: internal }),
      } as Response);
    }
    if (url.endsWith("/api/property/normalize")) {
      return Promise.resolve({
        ok: true,
        json: async () => internal,
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as Response);
  });
});

afterEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

test("renders PropertyCard with address and Edit button", async () => {
  render(<App />);

  // Wait for data to load
  await waitFor(() =>
    expect(
      screen.getByText(/10 Example St, Carlton VIC 3053/i)
    ).toBeInTheDocument()
  );

  // Smoke checks
  expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();

  // Status line is split across nodes: check the parent container text
  const statusRow = screen.getByText(/Status:/i).parentElement as HTMLElement;
  expect(statusRow).toHaveTextContent(/UnknownVolFol/i);
});
