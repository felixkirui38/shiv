"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string | number;
}

interface AdminDataTableProps<T extends Record<string, unknown> & { id: string }> {
  apiPath: string;
  columns: ColumnDef<T>[];
  statusOptions?: { value: string; label: string }[];
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
  bulkDelete?: boolean;
  exportFilename?: string;
  emptyMessage?: string;
}

export function AdminDataTable<T extends Record<string, unknown> & { id: string }>({
  apiPath,
  columns,
  statusOptions,
  onRowClick,
  renderActions,
  bulkDelete = false,
  exportFilename = "export",
  emptyMessage = "No records found.",
}: AdminDataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`${apiPath}?${params}`);
    const data = await res.json();
    if (data.success) {
      setItems(data.data.items ?? data.data);
      setTotal(data.data.pagination?.total ?? data.data.length ?? 0);
    }
    setLoading(false);
  }, [apiPath, page, search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function toggleAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleBulkDelete() {
    if (!bulkDelete || selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} record(s)?`)) return;
    await fetch("/api/admin/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource: apiPath.replace("/api/admin/", ""),
        ids: [...selected],
        action: "delete",
      }),
    });
    setSelected(new Set());
    load();
  }

  function handleExport() {
    const params = new URLSearchParams({ export: "csv" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    window.open(`${apiPath}?${params}`, "_blank");
  }

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        {statusOptions && (
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="size-4" /> CSV
        </Button>
        {bulkDelete && selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1.5">
            <Trash2 className="size-4" /> Delete ({selected.size})
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {bulkDelete && (
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left font-medium text-slate-600">{col.label}</th>
                  ))}
                  {renderActions && (
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "border-b last:border-0 hover:bg-slate-50/80",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {bulkDelete && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {renderActions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total} records</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="px-2 py-1">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
