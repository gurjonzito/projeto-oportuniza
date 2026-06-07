import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function AdminTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado.",
}: AdminTableProps<T>) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg, white)",
        borderColor: "var(--border-color, #e5e7eb)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr
              style={{
                backgroundColor: "var(--table-head-bg, #f9fafb)",
                borderBottom: "1px solid var(--border-color, #e5e7eb)",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted, #9ca3af)" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10">
                  <div
                    className="flex items-center justify-center gap-2"
                    style={{ color: "var(--text-muted, #9ca3af)" }}
                  >
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-sm"
                  style={{ color: "var(--text-muted, #9ca3af)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-blue-50" : ""}`}
                  style={{
                    borderBottom:
                      i < data.length - 1
                        ? "1px solid var(--border-color, #f3f4f6)"
                        : "none",
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3"
                      style={{ color: "var(--text-color)" }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
