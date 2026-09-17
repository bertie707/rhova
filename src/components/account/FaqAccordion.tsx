"use client";

import { useState } from "react";

// Placeholder copy — tell Claude what you actually want these to say and
// it'll update them; these just make sure the section isn't empty.
const FAQS = [
  {
    q: "How is this data collected?",
    a: "Every listing comes from an actual phone call to the host. No scraping, no copy-pasted directory data. Each one shows whether it's been verified yet.",
  },
  {
    q: "Is Rhova free to use?",
    a: "Yes, browsing the map and every listing is free.",
  },
  {
    q: "How do I actually book a placement?",
    a: "Rhova isn't a booking platform. Use the contact details on a listing to get in touch with the host directly, same as if a friend had given you the number.",
  },
  {
    q: "Can I save places I'm interested in?",
    a: "Yes, log in with just your email (no password) and tap the heart on any listing to save it to your favourites.",
  },
  {
    q: "What if a listing looks out of date?",
    a: "Use the Feedback link and let us know. Listings show when they were last verified so you can judge for yourself too.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="border-b border-mist-deep last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium"
            >
              {item.q}
              <span className={`ml-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
            </button>
            {open && <p className="pb-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
