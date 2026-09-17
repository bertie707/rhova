"use client";

import { SKILL_LABELS } from "@/lib/types";
import type { FilterState } from "@/lib/filters";

interface FilterPanelProps {
  open: boolean;
  state: FilterState;
  onChange: (next: Partial<FilterState>) => void;
}

export default function FilterPanel({ open, state, onChange }: FilterPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute top-[62px] right-0 z-[500] w-[230px] rounded-2xl bg-cloud p-4.5 shadow-[0_8px_28px_rgba(20,40,35,0.22)] backdrop-blur-sm">
      <div className="mb-2.5 text-[11.5px] font-semibold text-ink-soft">Support offered</div>
      <label className="mb-2.5 flex cursor-pointer items-center gap-2 text-[13.5px] select-none">
        <input
          type="checkbox"
          checked={state.housing}
          onChange={(e) => onChange({ housing: e.target.checked })}
          className="h-4 w-4 accent-teal"
        />
        Helps with housing
      </label>
      <label className="mb-2.5 flex cursor-pointer items-center gap-2 text-[13.5px] select-none">
        <input
          type="checkbox"
          checked={state.job}
          onChange={(e) => onChange({ job: e.target.checked })}
          className="h-4 w-4 accent-teal"
        />
        Helps with a job
      </label>

      <hr className="my-3.5 border-t border-mist-deep" />

      <div className="mb-2.5 text-[11.5px] font-semibold text-ink-soft">Minimum skill level</div>
      <div className="mt-1.5 mb-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            aria-label={`Minimum skill level ${level}`}
            onClick={() => onChange({ minSkill: state.minSkill === level ? 0 : level })}
            className={`h-[7px] flex-1 rounded ${level <= state.minSkill ? "bg-gold" : "bg-mist-deep"}`}
          />
        ))}
      </div>
      <div className="mt-1 text-[11px] text-ink-soft">
        {state.minSkill === 0 ? "Any level" : SKILL_LABELS[state.minSkill]}
      </div>
    </div>
  );
}
