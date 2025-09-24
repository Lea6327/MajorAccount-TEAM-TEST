import Modal from "../components/Modal";
import React, { useMemo, useState, useCallback } from "react";

export type InternalProperty = {
  fullAddress: string;
  lotPlan?: { lot?: string; plan?: string };
  volumeFolio: { volume: string | null; folio: string | null };
  status: "KnownVolFol" | "UnknownVolFol";
  sourceTrace: { provider?: string; requestId?: string; receivedAt?: string };
};

// Validation regex used by the Confirm handler
const volRx = /^\d{1,6}$/;   // Volume: 1–6 digits
const folioRx = /^\d{1,5}$/; // Folio: 1–5 digits

// Small helper to enforce a numeric mask while typing
const digitsOnly = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

export default function PropertyCard({ initial }: { initial: InternalProperty }) {
  const [p, setP] = useState(initial);
  const [open, setOpen] = useState(false);

  // Local editing state for modal inputs
  const [vol, setVol] = useState(p.volumeFolio.volume ?? "");
  const [fol, setFol] = useState(p.volumeFolio.folio ?? "");
  const [errs, setErrs] = useState<{ vol?: string; fol?: string }>({});

  const close = useCallback(() => setOpen(false), []);

  // Preview next status while editing
  const nextStatus = useMemo(
    () => (vol && fol ? "KnownVolFol" : "UnknownVolFol") as InternalProperty["status"],
    [vol, fol]
  );

  // Save changes if valid; otherwise show inline errors
  const onConfirm = () => {
    const e: typeof errs = {};
    if (vol && !volRx.test(vol)) e.vol = "Volume must be 1–6 digits";
    if (fol && !folioRx.test(fol)) e.fol = "Folio must be 1–5 digits";
    setErrs(e);
    if (Object.keys(e).length) return;

    setP((s) => ({
      ...s,
      volumeFolio: { volume: vol || null, folio: fol || null },
      status: nextStatus,
    }));
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Read-only card view */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xl font-semibold">{p.fullAddress}</div>

            <div className="text-base text-gray-700">
              <span className="font-medium">Lot/Plan:</span>{" "}
              {p.lotPlan?.lot ?? "-"} / {p.lotPlan?.plan ?? "-"}
            </div>

            <div className="text-base">
              <span className="font-medium">Volume/Folio:</span>{" "}
              {p.volumeFolio.volume ?? "-"} / {p.volumeFolio.folio ?? "-"}
            </div>

            <div className="text-base">
              <span className="font-medium">Status:</span> {p.status}
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-medium">Source:</span>{" "}
              {p.sourceTrace.provider} · {p.sourceTrace.requestId} · {p.sourceTrace.receivedAt}
            </div>
          </div>

          {/* Open the edit modal */}
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setOpen(true)}
            aria-label="Edit volume/folio"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={open} onClose={close} title="Edit Volume/Folio">
        <div className="grid gap-6">
          {/* Volume */}
          <div>
            <label htmlFor="vol" className="block text-sm font-medium text-gray-700">
              Volume
            </label>
            <input
              id="vol"
              name="volume"
              aria-label="Volume"
              aria-invalid={!!errs.vol}
              value={vol}
              // Hard input mask: keep digits only and cap at 6
              onChange={(e) => setVol(digitsOnly(e.target.value, 6))}
              maxLength={6}
              className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errs.vol ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 123456"
            />
            {errs.vol && <p className="mt-1 text-sm text-red-600">{errs.vol}</p>}
          </div>

          {/* Folio */}
          <div>
            <label htmlFor="fol" className="block text-sm font-medium text-gray-700">
              Folio
            </label>
            <input
              id="fol"
              name="folio"
              aria-label="Folio"
              aria-invalid={!!errs.fol}
              value={fol}
              // Hard input mask: keep digits only and cap at 5
              onChange={(e) => setFol(digitsOnly(e.target.value, 5))}
              maxLength={5}
              className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errs.fol ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 12345"
            />
            {errs.fol && <p className="mt-1 text-sm text-red-600">{errs.fol}</p>}
          </div>

          {/* Footer: status preview + actions */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Will set status to:</span> {nextStatus}
            </div>
            <div className="flex gap-3">
              <button
                onClick={close}
                className="rounded-md border px-5 py-2.5 text-base hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={onConfirm}
                className="rounded-md bg-blue-600 px-6 py-2.5 text-base text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

