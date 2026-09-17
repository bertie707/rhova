"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLUB_SOURCE_LABELS } from "@/lib/types";
import type { ClubWithMedia } from "@/lib/types";

export default function ClubTable({ clubs }: { clubs: ClubWithMedia[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(club: ClubWithMedia) {
    if (!confirm(`Delete "${club.name}"? This can't be undone.`)) return;
    setDeletingId(club.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clubs/${club.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Couldn't delete "${club.name}"`);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (clubs.length === 0) {
    return <p className="text-sm text-ink-soft">No clubs yet. Add your first one.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-mist-deep">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-mist text-xs text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Source</th>
            <th className="px-4 py-3 font-semibold">Verified</th>
            <th className="px-4 py-3 font-semibold">Live</th>
            <th className="px-4 py-3 font-semibold">Sample?</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.id} className="border-t border-mist-deep">
              <td className="px-4 py-3 font-medium">{club.name}</td>
              <td className="px-4 py-3 capitalize">{club.category}</td>
              <td className="px-4 py-3">
                {club.city}, {club.country}
              </td>
              <td className="px-4 py-3">
                {club.source === "self_submitted" ? (
                  <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold-deep">
                    {CLUB_SOURCE_LABELS.self_submitted}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">{club.verified ? "✓" : "-"}</td>
              <td className="px-4 py-3">
                {club.published ? "✓" : <span className="text-coral-deep">Draft</span>}
              </td>
              <td className="px-4 py-3">{club.isSampleData ? "Sample" : "-"}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link href={`/admin/clubs/${club.id}/edit`} className="mr-4 font-medium text-teal hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(club)}
                  disabled={deletingId === club.id}
                  className="font-medium text-coral-deep hover:underline disabled:opacity-50"
                >
                  {deletingId === club.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
