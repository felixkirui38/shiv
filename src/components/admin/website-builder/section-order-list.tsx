"use client";

import { useState } from "react";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { BUILDER_SECTION_META } from "@/config/website-builder.defaults";
import type { WebsiteSectionId } from "@/types/website-builder";
import { cn } from "@/lib/utils";

interface SectionOrderListProps {
  order: WebsiteSectionId[];
  visibility: Record<WebsiteSectionId, boolean>;
  activeId: string;
  onSelect: (id: string) => void;
  onReorder: (order: WebsiteSectionId[]) => void;
  onToggleVisibility: (id: WebsiteSectionId) => void;
}

export function SectionOrderList({
  order,
  visibility,
  activeId,
  onSelect,
  onReorder,
  onToggleVisibility,
}: SectionOrderListProps) {
  const [dragId, setDragId] = useState<WebsiteSectionId | null>(null);

  function handleDrop(targetId: WebsiteSectionId) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    onReorder(next);
    setDragId(null);
  }

  const labelMap = Object.fromEntries(
    BUILDER_SECTION_META.map((s) => [s.id, s.label])
  );

  return (
    <ul className="space-y-1">
      {order.map((id) => (
        <li
          key={id}
          draggable
          onDragStart={() => setDragId(id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(id)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition",
            activeId === id
              ? "border-primary bg-primary/5"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <GripVertical className="size-4 shrink-0 cursor-grab text-slate-400" />
          <button
            type="button"
            className="min-w-0 flex-1 text-left font-medium"
            onClick={() => onSelect(id)}
          >
            {labelMap[id] ?? id}
          </button>
          <button
            type="button"
            title={visibility[id] ? "Hide section" : "Show section"}
            onClick={() => onToggleVisibility(id)}
            className="text-slate-400 hover:text-slate-700"
          >
            {visibility[id] !== false ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4 text-amber-500" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
