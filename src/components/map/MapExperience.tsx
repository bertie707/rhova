"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ClubWithMedia } from "@/lib/types";
import { filterClubs, initialFilterState, type FilterState } from "@/lib/filters";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";
import FilterPanel from "./FilterPanel";
import DetailCard from "./DetailCard";
import { VisitorProvider } from "../account/VisitorContext";
import AccountDrawer from "../account/AccountDrawer";
import WelcomeScreen from "../account/WelcomeScreen";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

const WELCOME_SEEN_KEY = "gyc_seen_welcome";

interface MapExperienceProps {
  initialClubs: ClubWithMedia[];
}

function FilterIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="white" />
      <circle cx="16" cy="12" r="2" fill="white" />
      <circle cx="7" cy="18" r="2" fill="white" />
    </svg>
  );
}

export default function MapExperience({ initialClubs }: MapExperienceProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const filterWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Client-only check — starting both server and initial client render at
    // `false` avoids a hydration mismatch; this flips it shortly after
    // mount on a genuine first visit.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(WELCOME_SEEN_KEY)) setShowWelcome(true);
    } catch {
      // Private browsing / storage blocked — just skip the welcome screen.
    }
  }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {
      // Best-effort — worst case it shows again next visit.
    }
  }

  const categories = useMemo(
    () => [...new Set(initialClubs.map((c) => c.category))].sort(),
    [initialClubs]
  );

  const filteredClubs = useMemo(() => filterClubs(initialClubs, filters), [initialClubs, filters]);
  const selectedClub = filteredClubs.find((c) => c.id === selectedClubId) ?? null;

  const activeFilterCount =
    (filters.housing ? 1 : 0) + (filters.job ? 1 : 0) + (filters.minSkill > 0 ? 1 : 0);

  function toggleCategory(category: string) {
    setFilters((prev) => ({
      ...prev,
      query: prev.query.trim().toLowerCase() === category.toLowerCase() ? "" : category,
    }));
  }

  // Keyboard users should be able to dismiss any open overlay with Escape,
  // same as clicking outside them. Closest one wins if more than one is open.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (showWelcome) dismissWelcome();
      else if (drawerOpen) setDrawerOpen(false);
      else if (selectedClubId) setSelectedClubId(null);
      else if (filterPanelOpen) setFilterPanelOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClubId, filterPanelOpen, drawerOpen, showWelcome]);

  useEffect(() => {
    if (!filterPanelOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) {
        setFilterPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filterPanelOpen]);

  return (
    <VisitorProvider>
      <div className="fixed inset-0">
        <MapView clubs={filteredClubs} onSelectClub={setSelectedClubId} />

        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menu, profile and favourites"
          className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 rounded-full bg-cloud px-3.5 py-2.5 shadow-[0_4px_18px_rgba(20,40,35,0.18)] backdrop-blur-sm sm:top-[18px] sm:left-[18px] sm:px-4"
        >
          <span className="hidden font-serif text-base font-bold sm:inline wordmark-velvet">Rhova</span>
          <span className="text-sm leading-none text-ink-soft" aria-hidden="true">
            ▾
          </span>
        </button>

        <div className="absolute top-3 right-3 left-14 z-[500] flex flex-col gap-2 sm:top-[18px] sm:right-[18px] sm:left-auto sm:w-[300px]">
          <div className="flex items-center gap-2">
            <SearchBar value={filters.query} onSubmit={(query) => setFilters((prev) => ({ ...prev, query }))} />
            <div ref={filterWrapRef} className="relative shrink-0">
              <button
                onClick={() => setFilterPanelOpen((v) => !v)}
                aria-label="Filters"
                className={`flex h-[46px] w-[46px] items-center justify-center rounded-full shadow-[0_4px_18px_rgba(20,40,35,0.18)] backdrop-blur-sm ${
                  filterPanelOpen ? "bg-teal text-white" : "bg-cloud text-ink"
                }`}
              >
                <FilterIcon />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <FilterPanel
                open={filterPanelOpen}
                state={filters}
                onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
              />
            </div>
          </div>
          <CategoryChips categories={categories} activeQuery={filters.query} onToggle={toggleCategory} />
        </div>

        <div className="absolute bottom-3 left-3 z-[500] rounded-full bg-cloud px-4 py-2 text-[12.5px] text-ink-soft shadow-[0_4px_14px_rgba(20,40,35,0.16)] backdrop-blur-sm sm:bottom-[18px] sm:left-[18px]">
          <strong className="text-ink">{filteredClubs.length}</strong> places on the map
        </div>

        {selectedClub && (
          <DetailCard
            club={selectedClub}
            onClose={() => setSelectedClubId(null)}
            onRequireLogin={() => setDrawerOpen(true)}
          />
        )}

        <AccountDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSelectClub={setSelectedClubId}
        />

        {showWelcome && (
          <WelcomeScreen
            onLogin={() => {
              dismissWelcome();
              setDrawerOpen(true);
            }}
            onDismiss={dismissWelcome}
          />
        )}
      </div>
    </VisitorProvider>
  );
}
