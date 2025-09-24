
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyCard, { type InternalProperty } from "../components/PropertyCard";

// Base fixture used for all test cases
const base: InternalProperty = {
  fullAddress: "10 Example St, Carlton VIC 3053",
  lotPlan: { lot: "12", plan: "PS123456" },
  volumeFolio: { volume: null, folio: null },
  status: "UnknownVolFol",
  sourceTrace: {
    provider: "VIC-DDP",
    requestId: "REQ-12345",
    receivedAt: "2025-08-30T03:12:45Z",git commit -m "Fix PropertyCard tests
  },
};

describe("PropertyCard", () => {
  it("opens the modal and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<PropertyCard initial={base} />);

    // Act: open modal
    await user.click(screen.getByRole("button", { name: /edit/i }));
    // Assert: modal is present
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Act: close modal with Escape key
    await user.keyboard("{Escape}");
    // Assert: modal is removed from DOM
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("masks non-digits, caps length (vol<=6, fol<=5) and previews status", async () => {
    const user = userEvent.setup();
    render(<PropertyCard initial={base} />);

    // Open modal
    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = screen.getByRole("dialog");

    // Get inputs
    const volInput = within(dialog).getByRole("textbox", { name: /^volume$/i });
    const folInput = within(dialog).getByRole("textbox", { name: /^folio$/i });

    // Volume: strips non-digits and caps at 6 characters
    await user.clear(volInput);
    await user.type(volInput, "abc1-2.3/4567"); // after mask -> "123456"
    expect(volInput).toHaveValue("123456");

    // Folio: strips non-digits and caps at 5 characters
    await user.clear(folInput);
    await user.type(folInput, "9a8b7c6"); // after mask -> "9876"
    expect(folInput).toHaveValue("9876");
    await user.type(folInput, "54"); // after mask -> "98765"
    expect(folInput).toHaveValue("98765");

    // Status preview should change to KnownVolFol
    expect(
      within(dialog).getAllByText((_, node) =>
        node?.textContent?.match(/Will set status to:\s*KnownVolFol/i) !== null
      )[0]
    ).toBeInTheDocument();

    // Validation messages should not appear due to masking
    expect(
      within(dialog).queryByText(/Volume must be 1–6 digits/i)
    ).toBeNull();
    expect(
      within(dialog).queryByText(/Folio must be 1–5 digits/i)
    ).toBeNull();
  });

  it("confirms updates and reflects new values on the card", async () => {
    const user = userEvent.setup();
    render(<PropertyCard initial={base} />);

    // Open modal
    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = screen.getByRole("dialog");

    // Fill inputs with overlong values (mask will truncate them)
    const volInput = within(dialog).getByRole("textbox", { name: /^volume$/i });
    const folInput = within(dialog).getByRole("textbox", { name: /^folio$/i });

    await user.clear(volInput);
    await user.type(volInput, "1234567"); // becomes "123456"
    await user.clear(folInput);
    await user.type(folInput, "123456"); // becomes "12345"

    // Confirm changes
    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));

    // Wait until modal is removed from DOM
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Card should reflect new values and KnownVolFol status
    expect(
      screen.getAllByText((_, node) =>
        node?.textContent?.match(/Volume\/Folio:\s*123456\s*\/\s*12345/i) !== null
      )[0]
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/KnownVolFol/i)[0]
    ).toBeInTheDocument();
  });
});




