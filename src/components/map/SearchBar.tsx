"use client";

import { useState } from "react";

interface SearchBarProps {
  value: string;
  onSubmit: (value: string) => void;
}

export default function SearchBar({ value, onSubmit }: SearchBarProps) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Keep the input in sync when a category chip changes `value` externally,
  // without a setState-in-effect cascade — see https://react.dev/learn/you-might-not-need-an-effect
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  return (
    <div className="flex flex-1 min-w-0 items-center gap-1 rounded-full bg-cloud py-1 px-4 shadow-[0_6px_24px_rgba(20,40,35,0.2)] backdrop-blur-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="shrink-0 opacity-55">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={draft}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(draft.trim());
        }}
        placeholder="rugby, Wellington…"
        className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[13.5px] text-ink placeholder:text-[#8C9A96] outline-none"
      />
    </div>
  );
}
