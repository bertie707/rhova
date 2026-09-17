import { prisma } from "@/lib/prisma";
import MapExperience from "@/components/map/MapExperience";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const clubs = await prisma.club.findMany({
    include: { media: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return <MapExperience initialClubs={clubs} />;
}
