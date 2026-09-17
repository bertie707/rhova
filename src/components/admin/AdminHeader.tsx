import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-mist-deep pb-4">
      <div>
        <Link href="/admin" className="mb-1 flex items-center">
          <span className="font-serif text-base font-bold">
            <span className="wordmark-velvet">Rhova</span> Admin
          </span>
        </Link>
        <h1 className="font-serif text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/admin/leads" className="text-sm font-medium text-ink-soft hover:text-ink">
          Leads
        </Link>
        <Link href="/admin/reviews" className="text-sm font-medium text-ink-soft hover:text-ink">
          Reviews
        </Link>
        <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
          View public map
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
