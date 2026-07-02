"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MediaUploadPanelProps {
  onUploaded?: () => void;
}

export function MediaUploadPanel({ onUploaded }: MediaUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      if (alt.trim()) body.append("alt", alt.trim());

      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setMessage(`Uploaded ${file.name}`);
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-slate-900">Upload media</h2>
      <p className="mt-1 text-sm text-slate-500">
        JPG, PNG, WebP, GIF, or PDF up to 15MB. Files are stored in Cloudinary.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Label htmlFor="media-alt">Alt text (optional)</Label>
          <Input
            id="media-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describe the image for accessibility"
            className="mt-1.5"
          />
        </div>
        <div>
          <input
            ref={inputRef}
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
            variant="accent"
            className="gap-2"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Choose file"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
