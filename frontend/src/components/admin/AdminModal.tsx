import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function AdminModal({
  title,
  open,
  onClose,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClass[size]} rounded-2xl shadow-2xl`}
        style={{ backgroundColor: "var(--card-bg, white)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-color, #e5e7eb)" }}
        >
          <h2
            className="font-semibold text-base"
            style={{ color: "var(--text-color)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
          >
            <X size={15} style={{ color: "var(--text-muted, #6b7280)" }} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div
            className="flex justify-end gap-2 px-6 py-4 border-t"
            style={{ borderColor: "var(--border-color, #e5e7eb)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
