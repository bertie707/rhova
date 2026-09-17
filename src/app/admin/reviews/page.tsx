import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import ReviewsTable from "@/components/admin/ReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { club: { select: { name: true } }, visitor: { select: { email: true } } },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <AdminHeader title="Reviews" />
      <p className="mb-4 text-sm text-ink-soft">
        {reviews.length} total · {pendingCount} pending approval
      </p>
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
