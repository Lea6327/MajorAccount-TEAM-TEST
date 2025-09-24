import React, { useEffect } from "react";

type Props = {
  open: boolean;           // Whether the modal is visible
  onClose: () => void;     // Callback to close modal
  title?: string;          // Optional modal title
  children: React.ReactNode; // Modal content
};

export default function Modal({ open, onClose, title, children }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Close when clicking on the backdrop
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
      {/* Modal container: centered, scrollable if content is too tall */}
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header with optional title and close button */}
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

        {/* Body content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
