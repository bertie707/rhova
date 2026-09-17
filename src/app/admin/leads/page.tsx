import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import BulkAddLeads from "@/components/admin/BulkAddLeads";
import LeadsTable from "@/components/admin/LeadsTable";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const notContacted = leads.filter((l) => l.status === "not_contacted").length;
  const replied = leads.filter((l) => l.status === "replied").length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <AdminHeader title="Leads" />
      <p className="mb-6 -mt-2 text-sm text-ink-soft">
        Track clubs you&apos;re emailing before they become full listings: {leads.length} total,{" "}
        {notContacted} not yet contacted, {replied} replied.
      </p>
      <BulkAddLeads />
      <LeadsTable leads={leads} />
    </div>
  );
}
