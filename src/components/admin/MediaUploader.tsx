"use client";

import { useRef, useState } from "react";
import type { Media } from "@prisma/client";

export default function MediaUploader({ clubId, initialMedia }: { clubId: string; initialMedia: Media[] }) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", clubId);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const newMedia = await res.json();
          setMedia((prev) => [...prev, newMedia]);
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Upload failed");
        }
      } catch {
        setError("Couldn't reach the server. Check your connection and try again.");
        break;
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (deletingIds.has(id)) return;
    if (!confirm("Remove this file?")) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Couldn't remove that file");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-mist-deep p-5">
      <h2 className="mb-4 font-serif text-base font-bold">Photos & video</h2>

      {media.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-xl bg-mist">
              {m.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-28 w-full object-cover" />
              ) : (
                <video src={m.url} className="h-28 w-full object-cover" muted />
              )}
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                disabled={deletingIds.has(m.id)}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white disabled:opacity-50"
                aria-label="Remove"
              >
                &times;
              </button>
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white capitalize">
                {m.type}
              </span>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
        className="block text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal/90"
      />
      {uploading && <p className="mt-2 text-xs text-ink-soft">Uploading…</p>}
      {error && <p className="mt-2 text-xs text-coral-deep">{error}</p>}
      <p className="mt-2 text-xs text-ink-soft">Files save straight to this club, up to 50MB each.</p>
    </section>
  );
}
