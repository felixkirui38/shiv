"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

interface MediaItem {
  id: string;
  name: string;
  url: string;
}

interface MediaPickerProps {
  value?: string | null;
  imageUrl?: string | null;
  onChange: (mediaId: string | null, url?: string | null) => void;
  label?: string;
}

export function MediaPicker({ value, imageUrl, onChange, label = "Featured image" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadMedia() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "40" });
    if (search) params.set("search", search);
    fetch(`/api/admin/media?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data.items ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [open, search]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = await res.json();
      if (data.success) {
        onChange(data.data.id, data.data.url);
        setOpen(false);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {value && imageUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200">
          <div className="relative aspect-video w-full max-w-md">
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 bg-white/90"
            onClick={() => onChange(null, null)}
          >
            <X className="size-4" /> Remove
          </Button>
        </div>
      ) : (
        <>
          <Button type="button" variant="outline" className="gap-2" onClick={() => setOpen(true)}>
            <ImageIcon className="size-4" /> Select image
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Media library</SheetTitle>
            </SheetHeader>
            <Input
              placeholder="Search media…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-4"
            />
            <div className="mt-3">
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploading ? "Uploading…" : "Upload new"}
              </Button>
            </div>
            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Loading…</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="overflow-hidden rounded-lg border border-slate-200 text-left transition hover:border-primary"
                    onClick={() => {
                      onChange(m.id, m.url);
                      setOpen(false);
                    }}
                  >
                    <div className="relative aspect-video">
                      <Image src={m.url} alt={m.name} fill className="object-cover" unoptimized />
                    </div>
                    <p className="truncate p-2 text-xs text-slate-600">{m.name}</p>
                  </button>
                ))}
              </div>
            )}
          </SheetContent>
        </Sheet>
        </>
      )}
    </div>
  );
}
