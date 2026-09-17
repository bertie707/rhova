"use client";

import { useEffect, useState } from "react";
import type { ClubWithMedia } from "@/lib/types";
import { useVisitor } from "./VisitorContext";
import LoginForm from "./LoginForm";
import FaqAccordion from "./FaqAccordion";
import PhotoPlaceholder from "../map/PhotoPlaceholder";

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectClub: (id: string) => void;
}

const MAX_NOTES_LENGTH = 5000;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 font-serif text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}

export default function AccountDrawer({ open, onClose, onSelectClub }: AccountDrawerProps) {
  const { visitor, loading, refresh, logout } = useVisitor();
  const [favorites, setFavorites] = useState<ClubWithMedia[]>([]);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [prevVisitorNotes, setPrevVisitorNotes] = useState(visitor?.notes);

  // Reset the textarea when the visitor identity changes (login/logout),
  // computed during render rather than in an effect —
  // see https://react.dev/learn/you-might-not-need-an-effect
  if (visitor?.notes !== prevVisitorNotes) {
    setPrevVisitorNotes(visitor?.notes);
    setNotes(visitor?.notes ?? "");
  }

  useEffect(() => {
    if (!open || !visitor) return;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : []))
      .then(setFavorites)
      .catch(() => setFavorites([]));
  }, [open, visitor]);

  async function handleSaveNotes() {
    setNotesSaving(true);
    setNotesSaved(false);
    try {
      const res = await fetch("/api/me/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) setNotesSaved(true);
    } catch {
      // Best-effort save — the textarea keeps the user's text regardless.
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleRemoveFavorite(clubId: string) {
    setFavorites((prev) => prev.filter((c) => c.id !== clubId));
    await fetch(`/api/favorites/${clubId}`, { method: "DELETE" }).catch(() => null);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 left-0 flex w-[85vw] max-w-[360px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-mist-deep px-5 py-4">
          <div className="flex items-center">
            <span className="font-serif text-base font-bold wordmark-velvet">Rhova</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-2xl text-ink-soft hover:text-ink">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!loading && !visitor && (
            <Section title="Log in">
              <LoginForm onLoggedIn={() => refresh()} />
            </Section>
          )}

          {!loading && visitor && (
            <>
              <Section title="Profile">
                <p className="mb-2 text-sm">{visitor.email}</p>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-coral-deep hover:underline"
                >
                  Log out
                </button>
              </Section>

              <Section title="Favourites">
                {favorites.length === 0 ? (
                  <p className="text-sm text-ink-soft">
                    Nothing saved yet. Tap the heart on a listing to save it here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((club) => (
                      <div
                        key={club.id}
                        className="flex items-center gap-3 rounded-xl border border-mist-deep p-2"
                      >
                        <button
                          onClick={() => {
                            onSelectClub(club.id);
                            onClose();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          {club.media[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={club.media[0].url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <PhotoPlaceholder className="h-10 w-10 shrink-0 rounded-lg" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{club.name}</span>
                            <span className="block truncate text-xs text-ink-soft">
                              {club.city}, {club.country}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(club.id)}
                          aria-label={`Remove ${club.name} from favourites`}
                          className="shrink-0 text-lg text-ink-soft hover:text-coral-deep"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="My gap year ideas">
                <p className="mb-2 text-xs text-ink-soft">
                  A private scratchpad, only you can see this.
                </p>
                <textarea
                  value={notes}
                  maxLength={MAX_NOTES_LENGTH}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNotesSaved(false);
                  }}
                  rows={4}
                  placeholder="Want to try rugby in NZ, maybe a ski season after..."
                  className="mb-2 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-sm outline-none focus:border-teal"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                    className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 disabled:opacity-60"
                  >
                    {notesSaving ? "Saving…" : "Save"}
                  </button>
                  {notesSaved && <span className="text-xs text-teal">Saved</span>}
                </div>
              </Section>
            </>
          )}

          <Section title="FAQ">
            <FaqAccordion />
          </Section>

          {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=Rhova%20feedback`}
              className="text-sm font-medium text-teal hover:underline"
            >
              Send feedback
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
