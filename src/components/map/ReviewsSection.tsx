"use client";

import { useEffect, useState } from "react";
import { useVisitor } from "../account/VisitorContext";
import type { PublicReview } from "@/lib/types";

interface ReviewsSectionProps {
  clubId: string;
  onRequireLogin: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-gold" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-mist-deep">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsSection({ clubId, onRequireLogin }: ReviewsSectionProps) {
  const { visitor } = useVisitor();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clubs/${clubId}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [clubId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clubs/${clubId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, rating, text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
      setFormOpen(false);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-3">
      <div className="mb-1 text-[10.5px] font-semibold text-ink-soft">
        Reviews from people who&apos;ve done this
      </div>

      {reviews.length === 0 ? (
        <p className="mb-2 text-[13px] text-ink-soft">No reviews yet.</p>
      ) : (
        <div className="mb-2 space-y-2.5">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-[10px] bg-mist p-2.5">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold">{r.authorName}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-[12.5px] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <p className="text-[12.5px] text-teal">Thanks. Your review is pending approval.</p>
      ) : !visitor ? (
        <button
          onClick={onRequireLogin}
          className="text-[12.5px] font-semibold text-teal hover:underline"
        >
          Log in to leave a review
        </button>
      ) : !formOpen ? (
        <button
          onClick={() => setFormOpen(true)}
          className="text-[12.5px] font-semibold text-teal hover:underline"
        >
          Write a review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-[10px] bg-mist p-2.5">
          <input
            required
            maxLength={100}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="mb-2 w-full rounded-lg border border-mist-deep px-2.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
          />
          <div className="mb-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
                className={n <= rating ? "text-gold" : "text-mist-deep"}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            required
            maxLength={2000}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What was it actually like?"
            className="mb-2 w-full rounded-lg border border-mist-deep px-2.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
          />
          {error && <p className="mb-2 text-[11.5px] text-coral-deep">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-coral px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-[12px] font-medium text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
