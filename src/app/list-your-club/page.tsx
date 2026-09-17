import type { Metadata } from "next";
import Link from "next/link";
import ListYourClubForm from "@/components/public/ListYourClubForm";

export const metadata: Metadata = {
  title: "List your club — Rhova",
  description:
    "Add your club to Rhova so gap year travellers can find you. Takes a few minutes — we'll review your listing before it goes live.",
};

export default function ListYourClubPage() {
  return (
    <div className="min-h-full bg-mist">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="mb-6 inline-flex items-center">
          <span className="font-serif text-lg font-bold wordmark-velvet">Rhova</span>
        </Link>

        <h1 className="mb-2 font-serif text-2xl font-bold text-ink sm:text-3xl">List your club</h1>
        <p className="mb-8 max-w-xl text-sm text-ink-soft">
          Rhova helps gap year travellers find clubs like yours abroad. Fill in the details below and
          we&apos;ll review your listing before it goes live — no account needed.
        </p>

        <ListYourClubForm />
      </div>
    </div>
  );
}
