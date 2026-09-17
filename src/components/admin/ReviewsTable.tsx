"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@prisma/client";

type ReviewWithRelations = Review & { club: { name: string }; visitor: { email: string } };

export default function ReviewsTable({ reviews }: { reviews: ReviewWithRelations[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setApproved(id: string, approved: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) router.refresh();
      else setError("Couldn't update that review");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError("Couldn't delete that review");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-ink-soft">No reviews yet.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-mist-deep p-4">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <span className="font-semibold">{r.club.name}</span>
                <span className="ml-2 text-xs text-ink-soft">by {r.authorName} ({r.visitor.email})</span>
              </div>
              <span className="text-gold">{"★".repeat(r.rating)}<span className="text-mist-deep">{"★".repeat(5 - r.rating)}</span></span>
            </div>
            <p className="mb-3 text-sm">{r.text}</p>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${r.approved ? "text-teal" : "text-gold-deep"}`}>
                {r.approved ? "Approved" : "Pending"}
              </span>
              <button
                onClick={() => setApproved(r.id, !r.approved)}
                disabled={busyId === r.id}
                className="text-sm font-medium text-teal hover:underline disabled:opacity-50"
              >
                {r.approved ? "Unapprove" : "Approve"}
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={busyId === r.id}
                className="text-sm font-medium text-coral-deep hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
