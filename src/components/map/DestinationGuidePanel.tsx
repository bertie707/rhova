"use client";

import type { ClubWithMedia } from "@/lib/types";
import { GUIDE_SECTIONS, parseDestinationGuide, cleanDestinationGuide } from "@/lib/destinationGuide";

interface DestinationGuidePanelProps {
  club: ClubWithMedia;
  onClose: () => void;
}

function Prose({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-1.5 font-serif text-[15px] font-bold">{heading}</h3>
      <p className="text-[13.5px] leading-relaxed text-ink">{children}</p>
    </div>
  );
}

export default function DestinationGuidePanel({ club, onClose }: DestinationGuidePanelProps) {
  const guide = cleanDestinationGuide(parseDestinationGuide(club.destinationGuide));
  const populatedSections = GUIDE_SECTIONS.filter(({ key }) => guide.sections[key]);

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[90vh] w-[92vw] max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-mist-deep px-6 py-4">
          <div>
            <div className="mb-0.5 text-[10.5px] font-bold tracking-wide text-ink-soft uppercase">
              {club.category}
              {club.verified && <span className="ml-1.5 text-teal">· Verified</span>}
            </div>
            <div className="font-serif text-lg leading-tight font-bold">{club.name}</div>
            <div className="mt-0.5 text-xs text-ink-soft">
              {club.city}, {club.country}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-xl text-ink-soft hover:bg-mist"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <Prose heading="About this placement">{club.description}</Prose>
          <Prose heading="Social scene">{club.socialScene}</Prose>
          <Prose heading="A typical week">{club.typicalWeek}</Prose>
          <Prose heading="Placement length & intake">
            {club.placementLength}. Intake: {club.intakeTiming}.
          </Prose>
          <Prose heading="Language & visa">
            {club.languageNeeded} {club.visaNote}
          </Prose>
          <Prose heading="Nearby">{club.nearby}</Prose>
          <Prose heading="Safety notes">{club.safetyNotes}</Prose>

          {populatedSections.length > 0 && (
            <>
              <hr className="my-5 border-t border-mist-deep" />
              {populatedSections.map(({ key, heading }) => (
                <Prose key={key} heading={heading}>
                  {guide.sections[key]}
                </Prose>
              ))}
              <p className="mb-5 text-[11px] text-ink-soft italic">
                Local guide — researched with AI, reviewed by Rhova.
              </p>
            </>
          )}

          {guide.faq.length > 0 && (
            <>
              <hr className="my-5 border-t border-mist-deep" />
              <h3 className="mb-2.5 font-serif text-[15px] font-bold">Quick answers</h3>
              <ul className="mb-5 flex flex-col gap-2.5">
                {guide.faq.map((item, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed">
                    <span className="font-semibold">{item.question}</span>{" "}
                    <span className="text-ink-soft">{item.answer}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <hr className="my-5 border-t border-mist-deep" />
          <div className="text-[13.5px] leading-relaxed">
            <div className="mb-1 text-[10.5px] font-semibold text-ink-soft">Contact</div>
            <div>{club.contactName}</div>
            <div>{club.contactPhone}</div>
            <div>{club.contactEmail}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
