"use client";

import { useState } from "react";
import { SKILL_LABELS } from "@/lib/types";
import type { ClubWithMedia } from "@/lib/types";
import PhotoPlaceholder from "./PhotoPlaceholder";
import FavoriteButton from "./FavoriteButton";
import ReviewsSection from "./ReviewsSection";
import DestinationGuidePanel from "./DestinationGuidePanel";

interface DetailCardProps {
  club: ClubWithMedia;
  onClose: () => void;
  onRequireLogin: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[10.5px] font-semibold text-ink-soft">{label}</div>
      <div className="text-[13.5px] leading-relaxed">{children}</div>
    </div>
  );
}

export default function DetailCard({ club, onClose, onRequireLogin }: DetailCardProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  const photos = club.media.filter((m) => m.type === "photo");
  const video = club.media.find((m) => m.type === "video");
  const hero = photos[0];
  const gallery = photos.slice(1);

  return (
    <div className="fixed inset-0 z-[900] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2.5 right-3 z-20 text-2xl text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        >
          &times;
        </button>

        <div className="absolute top-2.5 left-3 z-20">
          <FavoriteButton clubId={club.id} onRequireLogin={onRequireLogin} />
        </div>

        <div className="relative h-[150px] bg-[#DDE3E0]">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.url} alt={club.name} className="h-full w-full object-cover" />
          ) : (
            <PhotoPlaceholder className="h-full w-full" />
          )}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(10,20,18,0.82)] to-[rgba(10,20,18,0)] to-65% p-4.5 text-white">
            <div className="mb-0.5 flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide opacity-90">
              {club.category.toUpperCase()}
              {club.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal/90 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="font-serif text-[17px] leading-tight font-bold">{club.name}</div>
            <div className="mt-0.5 text-xs opacity-90">
              {club.city}, {club.country}
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-5">
          <p className="mb-3 text-[13.5px] leading-relaxed">{club.description}</p>

          {(gallery.length > 0 || video) && (
            <Field label="Photos & video">
              {gallery.length > 0 && (
                <div className="mt-1.5 flex gap-1.5">
                  {gallery.slice(0, 2).map((m) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={m.id} src={m.url} alt="" className="h-[72px] w-1/2 rounded-[10px] object-cover" />
                  ))}
                </div>
              )}
              {video && (
                <video controls poster={hero?.url} className="mt-2 w-full rounded-[10px] bg-black">
                  <source src={video.url} />
                </video>
              )}
            </Field>
          )}

          <Field label="Skill level required">
            <div>{SKILL_LABELS[club.skillLevel]}</div>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-1.5 flex-1 rounded ${n <= club.skillLevel ? "bg-gold" : "bg-mist-deep"}`} />
              ))}
            </div>
          </Field>

          <Field label="Support offered">
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-[10px] p-2.5 ${club.housingHelp ? "bg-[#DCF2EC]" : "bg-mist"}`}>
                <div className="text-[10px] text-ink-soft">Housing</div>
                <div className={`mt-0.5 text-[13px] font-semibold ${club.housingHelp ? "text-teal" : ""}`}>
                  {club.housingHelp ? "Arranged" : "Not offered"}
                </div>
              </div>
              <div className={`rounded-[10px] p-2.5 ${club.jobHelp ? "bg-[#DCF2EC]" : "bg-mist"}`}>
                <div className="text-[10px] text-ink-soft">Work</div>
                <div className={`mt-0.5 text-[13px] font-semibold ${club.jobHelp ? "text-teal" : ""}`}>
                  {club.jobHelp ? "Arranged" : "Not offered"}
                </div>
              </div>
            </div>
          </Field>

          <div className="mb-3">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-[10px] bg-mist p-2 text-center">
                <div className="text-[10px] text-ink-soft">Typical age</div>
                <div className="mt-0.5 text-[13px] font-semibold">
                  {club.ageRangeMin}–{club.ageRangeMax}
                </div>
              </div>
              <div className="rounded-[10px] bg-mist p-2 text-center">
                <div className="text-[10px] text-ink-soft">Cost of living</div>
                <div className="mt-0.5 text-[13px] font-semibold">{club.costTier}</div>
              </div>
              <div className="rounded-[10px] bg-mist p-2 text-center">
                <div className="text-[10px] text-ink-soft">Car needed</div>
                <div className="mt-0.5 text-[13px] font-semibold">{club.carNeeded ? "Yes" : "No"}</div>
              </div>
            </div>
            <div className="mt-1.5 text-[10.5px] leading-relaxed text-ink-soft">
              {club.costDetail} · {club.carNote}
            </div>
          </div>

          <ReviewsSection clubId={club.id} onRequireLogin={onRequireLogin} />

          <button
            onClick={() => setGuideOpen(true)}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-mist py-2.5 text-[12.5px] font-semibold hover:bg-mist-deep"
          >
            Tap for more detail
          </button>

          {guideOpen && <DestinationGuidePanel club={club} onClose={() => setGuideOpen(false)} />}

          <hr className="my-3.5 border-t border-mist-deep" />

          <Field label="Contact">{club.contactName}</Field>
          <Field label="Phone">{club.contactPhone}</Field>
          <div>
            <div className="mb-1 text-[10.5px] font-semibold text-ink-soft">Email</div>
            <div className="text-[13.5px] leading-relaxed">{club.contactEmail}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
