import AdminHeader from "@/components/admin/AdminHeader";
import ClubForm from "@/components/admin/ClubForm";

export default function NewClubPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <AdminHeader title="Add a club" />
      <p className="mb-6 -mt-2 text-sm text-ink-soft">
        Save the basics first. You&apos;ll be able to add photos and video on the next screen.
      </p>
      <ClubForm mode="create" />
    </div>
  );
}
