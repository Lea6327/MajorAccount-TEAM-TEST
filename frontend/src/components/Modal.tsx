import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;                 // Whether the modal is visible
  onClose: () => void;           // Callback to close the modal
  title?: string;                // Optional modal title
  children: React.ReactNode;     // Modal content
};

export default function Modal({ open, onClose, title, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape + trap focus within the panel while open
  useEffect(() => {
    if (!open) return;

    // Collect focusable elements inside the panel
    const panel = panelRef.current!;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Remember previously focused element and focus the first element in modal
    const prevActive = document.activeElement as HTMLElement | null;
    (first ?? panel).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusables.length) {
        // Cycle focus within the modal
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Restore focus to the previously focused element
      prevActive?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  // Close when clicking the backdrop (ignore clicks inside the panel)
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
      onClick={onBackdropClick}
    >
      {/* Modal panel: centered, scrollable if content exceeds viewport */}
      <div
        ref={panelRef}
        tabIndex={-1} // allow programmatic focus when no focusable child exists
        className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        {/* Header with optional title and a close button */}
        {(title || title === "") && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-6 py-4">
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="rounded-md p-2 text-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

