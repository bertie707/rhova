import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service — Rhova",
  description: "The terms for using Rhova.",
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "the site owner";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 font-serif text-lg font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-full bg-mist">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/" className="mb-6 inline-flex items-center">
          <span className="font-serif text-lg font-bold wordmark-velvet">Rhova</span>
        </Link>

        <h1 className="mb-1 font-serif text-2xl font-bold text-ink sm:text-3xl">Terms of service</h1>
        <p className="mb-8 text-sm text-ink-soft">Last updated October 2026.</p>

        <Section title="What Rhova is">
          <p>Rhova is a directory of gap year placements abroad. By using it, you agree to these
            terms. If you don&apos;t agree, please don&apos;t use the site.</p>
          <p><strong className="text-ink">Rhova isn&apos;t a booking platform.</strong> We don&apos;t
            arrange placements, take payments, or act as an intermediary between you and a club —
            listings give you a club&apos;s contact details so you can get in touch directly, same as
            if a friend had given you the number.</p>
        </Section>

        <Section title="Accounts">
          <p>You&apos;re responsible for keeping your password private and for anything that happens
            under your account. Give us a real email address so password resets actually work. You
            can delete your account at any time from the account menu.</p>
        </Section>

        <Section title="Submitting a club listing">
          <p>If you list a club via &ldquo;List your club&rdquo;, you confirm the information is
            accurate to the best of your knowledge and that you have the right to share any photos
            you upload. Submissions are reviewed by an admin before going live, and we may edit,
            decline, or remove a listing at our discretion — for example if it&apos;s inaccurate, a
            duplicate, or we can&apos;t verify it.</p>
        </Section>

        <Section title="Reviews and other content you post">
          <p>Keep it honest and relevant. We can remove content that&apos;s abusive, spam, clearly
            false, or otherwise inappropriate.</p>
        </Section>

        <Section title="No guarantees">
          <p>We try to verify listings with a real phone call before they go live, but we can&apos;t
            guarantee a listing is fully accurate, current, or that any placement will work out — do
            your own research before committing to anything.</p>
          <p>The site is provided &ldquo;as is,&rdquo; without warranties of any kind. To the extent
            allowed by law, we&apos;re not liable for losses arising from your use of Rhova or from
            relying on information in a listing.</p>
        </Section>

        <Section title="Changes">
          <p>We may update these terms as the site changes. Continuing to use Rhova after an update
            means you accept the new terms.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal hover:underline">{CONTACT_EMAIL}</a>.</p>
        </Section>

        <p className="text-xs text-ink-soft">
          See also our <Link href="/privacy" className="text-teal hover:underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
