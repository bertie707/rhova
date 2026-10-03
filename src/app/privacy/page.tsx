import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy — Rhova",
  description: "How Rhova collects, uses, and protects your data.",
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

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-mist">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/" className="mb-6 inline-flex items-center">
          <span className="font-serif text-lg font-bold wordmark-velvet">Rhova</span>
        </Link>

        <h1 className="mb-1 font-serif text-2xl font-bold text-ink sm:text-3xl">Privacy policy</h1>
        <p className="mb-8 text-sm text-ink-soft">Last updated October 2026.</p>

        <Section title="Who we are">
          <p>
            Rhova is a directory of gap year placements. This policy covers the personal data
            collected through rhova.vercel.app. Questions or requests about your data can be sent
            to <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <p><strong className="text-ink">If you create a visitor account:</strong> your email address, a
            scrambled (hashed) version of your password — we never store or can see your actual
            password — any favourites you save, any private notes you write, and any reviews you
            post (author name, rating, text).</p>
          <p><strong className="text-ink">If you list a club via &ldquo;List your club&rdquo;:</strong> the
            club&apos;s details and the contact name, phone number, email address, and any photos
            you submit.</p>
          <p>We don&apos;t run analytics or advertising trackers, and we don&apos;t sell or share
            your data with advertisers.</p>
        </Section>

        <Section title="Why we collect it">
          <p>To run the account system (saving your favourites and notes between visits), to review
            and publish club listings, and to send you a password-reset code by email when you ask
            for one. Club contact details are published on the listing itself so gap year travellers
            can get in touch directly — that&apos;s the whole point of the directory.</p>
        </Section>

        <Section title="Cookies">
          <p>Rhova sets one functional cookie when you log in (to an account, or to the admin panel)
            so you stay signed in. It&apos;s required for the site to work and isn&apos;t used for
            tracking or advertising.</p>
        </Section>

        <Section title="Who else sees it">
          <p>We use a small number of service providers to run Rhova, each only processing what they
            need to do their job: Neon (database hosting), Vercel (web hosting and photo storage),
            Resend (sending password-reset emails), and Anthropic (used by site admins to help draft
            listing content — not applied to your personal account data). These providers may process
            data outside the UK/EEA under their own standard data-protection terms.</p>
        </Section>

        <Section title="How long we keep it">
          <p>Visitor accounts are kept until you delete them — you can do this yourself any time from
            the account menu (Profile → Delete my account), which permanently removes your email,
            password, favourites, and notes. Club listings are kept until an admin removes them, e.g.
            at the club&apos;s request.</p>
        </Section>

        <Section title="Your rights">
          <p>You can ask us what data we hold about you, correct it, or have it deleted — account
            data can be deleted instantly yourself; for anything else, email us at the address above
            and we&apos;ll handle it within a reasonable time.</p>
        </Section>

        <Section title="Children">
          <p>Rhova isn&apos;t intended for children under 16. We don&apos;t knowingly collect data
            from children.</p>
        </Section>

        <Section title="Changes">
          <p>If this policy changes meaningfully, we&apos;ll update the date at the top of this page.</p>
        </Section>
      </div>
    </div>
  );
}
