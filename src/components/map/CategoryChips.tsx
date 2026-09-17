"use client";

interface CategoryChipsProps {
  categories: string[];
  activeQuery: string;
  onToggle: (category: string) => void;
}

export default function CategoryChips({ categories, activeQuery, onToggle }: CategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {categories.map((category) => {
        const active = activeQuery.trim().toLowerCase() === category.toLowerCase();
        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            className={`rounded-full border-2 border-transparent px-3 py-1.5 text-xs font-medium shadow-[0_3px_10px_rgba(20,40,35,0.14)] backdrop-blur-sm transition-colors ${
              active ? "bg-teal text-white" : "bg-cloud text-ink-soft hover:text-ink"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
