// frontend/src/_tests_/PropertyCard.test.tsx
import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyCard, { type InternalProperty } from "../components/PropertyCard";

const base: InternalProperty = {
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

describe("PropertyCard", () => {
  test("opens the modal and closes it with Escape", async () => {
    render(<PropertyCard initial={base} />);
    const user = userEvent.setup();

    // open
    await user.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // close with ESC
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("shows validation errors for invalid inputs", async () => {
    render(<PropertyCard initial={base} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = screen.getByRole("dialog");

    const vol = within(dialog).getByLabelText(/^volume$/i);
    const fol = within(dialog).getByLabelText(/^folio$/i);

    await user.click(vol);
    await user.type(vol, "1234567"); // invalid: > 6 digits
    await user.click(fol);
    await user.type(fol, "abc");     // invalid: non-digits

    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));

    expect(await within(dialog).findByText(/Volume must be 1–6 digits/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Folio must be 1–5 digits/i)).toBeInTheDocument();
  });

  test("confirm updates card values and status", async () => {
    render(<PropertyCard initial={base} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = screen.getByRole("dialog");

    const vol = within(dialog).getByLabelText(/^volume$/i);
    const fol = within(dialog).getByLabelText(/^folio$/i);

    await user.click(vol);
    await user.clear(vol);
    await user.type(vol, "123456");

    await user.click(fol);
    await user.clear(fol);
    await user.type(fol, "12345");

    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));

    // wait for modal unmount (state updates are async)
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // assert row text via container (text is split across nodes)
    const vfRow = screen.getByText(/Volume\/Folio:/i).parentElement as HTMLElement;
    expect(vfRow).toHaveTextContent(/Volume\/Folio:\s*123456\s*\/\s*12345/i);

    const statusRow = screen.getByText(/Status:/i).parentElement as HTMLElement;
    expect(statusRow).toHaveTextContent(/KnownVolFol/i);
  });
});

