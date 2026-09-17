import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import ClubForm from "@/components/admin/ClubForm";
import MediaUploader from "@/components/admin/MediaUploader";

export const dynamic = "force-dynamic";

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await prisma.club.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });

  if (!club) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <AdminHeader title={`Edit ${club.name}`} />
      <MediaUploader clubId={club.id} initialMedia={club.media} />
      <ClubForm mode="edit" clubId={club.id} initial={club} />
    </div>
  );
}
