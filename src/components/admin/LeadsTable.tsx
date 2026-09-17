"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@prisma/client";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/types";

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
      else setError("Couldn't update that lead");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(lead: Lead) {
    if (!confirm(`Remove "${lead.name}" from the list?`)) return;
    setBusyId(lead.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError("Couldn't remove that lead");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (leads.length === 0) {
    return <p className="text-sm text-ink-soft">No leads yet. Paste a batch above to get started.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-mist-deep">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-mist text-xs text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-mist-deep">
                <td className="px-4 py-3 font-medium">
                  {lead.website ? (
                    <a
                      href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {lead.name}
                    </a>
                  ) : (
                    lead.name
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.city ? `${lead.city}, ` : ""}
                  {lead.country}
                </td>
                <td className="px-4 py-3">
                  <a href={`mailto:${lead.email}`} className="text-teal hover:underline">
                    {lead.email}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    disabled={busyId === lead.id}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className="rounded-lg border border-mist-deep px-2 py-1 text-xs outline-none focus:border-teal disabled:opacity-50"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(lead)}
                    disabled={busyId === lead.id}
                    className="text-xs font-medium text-coral-deep hover:underline disabled:opacity-50"
                  >
                    Remove
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
