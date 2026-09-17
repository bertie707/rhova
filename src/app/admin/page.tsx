import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import ClubTable from "@/components/admin/ClubTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const clubs = await prisma.club.findMany({
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });

  const selfSubmittedPending = clubs.filter(
    (c) => c.source === "self_submitted" && !c.published
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <AdminHeader title="Clubs" />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {clubs.length} total
          {selfSubmittedPending > 0 &&
            ` · ${selfSubmittedPending} self-submitted awaiting review`}
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export"
            className="rounded-full border border-mist-deep px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Export data
          </a>
          <Link
            href="/admin/clubs/new"
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-deep"
          >
            + Add a club
          </Link>
        </div>
      </div>
      <ClubTable clubs={clubs} />
    </div>
  );
}
