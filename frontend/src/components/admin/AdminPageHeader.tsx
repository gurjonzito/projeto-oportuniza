import type { ReactNode } from "react";
import { Plus } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  onAdd,
  addLabel = "Novo",
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-color)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-muted, #6b7280)" }}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
