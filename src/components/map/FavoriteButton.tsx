"use client";

import { useEffect, useState } from "react";
import { useVisitor } from "../account/VisitorContext";

interface FavoriteButtonProps {
  clubId: string;
  onRequireLogin: () => void;
}

export default function FavoriteButton({ clubId, onRequireLogin }: FavoriteButtonProps) {
  const { visitor } = useVisitor();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visitor) {
      // Reset when logging out — legitimate sync with the external auth state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavorited(false);
      return;
    }
    let cancelled = false;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : []))
      .then((clubs: { id: string }[]) => {
        if (!cancelled) setFavorited(clubs.some((c) => c.id === clubId));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visitor, clubId]);

  async function toggle() {
    if (!visitor) {
      onRequireLogin();
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !favorited;
    setFavorited(next); // optimistic
    try {
      if (next) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubId }),
        });
      } else {
        await fetch(`/api/favorites/${clubId}`, { method: "DELETE" });
      }
    } catch {
      setFavorited(!next); // revert on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={favorited}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-sm hover:bg-black/45"
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
