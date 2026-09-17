"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ClubWithMedia } from "@/lib/types";

interface MapViewProps {
  clubs: ClubWithMedia[];
  onSelectClub: (id: string) => void;
}

function pinIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="pin-wrap"><div class="pin"></div></div>`,
    iconSize: [30, 32],
    iconAnchor: [15, 30],
  });
}

function quickBubbleHtml(club: ClubWithMedia) {
  const thumb = club.media[0];
  const thumbHtml = thumb
    ? `<img class="qb-thumb" src="${escapeHtml(thumb.url)}" alt="" />`
    : `<div class="qb-thumb qb-thumb-empty"></div>`;
  return `
    <div class="qb-row">
      ${thumbHtml}
      <div>
        <div class="qb-name">${escapeHtml(club.name)}</div>
        <div class="qb-loc">${escapeHtml(club.city)}, ${escapeHtml(club.country)}</div>
        <div class="qb-tags">
          <span class="qb-tag ${club.housingHelp ? "yes" : ""}">${club.housingHelp ? "Housing" : "No housing"}</span>
          <span class="qb-tag ${club.jobHelp ? "yes" : ""}">${club.jobHelp ? "Job help" : "No job help"}</span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function MapView({ clubs, onSelectClub }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const hasFitBoundsRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const WORLD_BOUNDS = L.latLngBounds([-85, -180], [85, 180]);

    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: false,
      maxBounds: WORLD_BOUNDS,
      maxBoundsViscosity: 1.0,
    }).setView([20, 10], 2);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        // Required data-source credit per Esri's terms — kept, just styled
        // small and quiet via .leaflet-control-attribution in globals.css.
        attribution: "Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      }
    ).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    ).addTo(map);

    // Leaflet's own "Leaflet" self-promo link is optional — drop just that,
    // keep the required Esri data credit above.
    map.attributionControl.setPrefix(false);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Keep the minimum zoom high enough that the single world tile grid
    // always fills the container — otherwise, with world-copy repeats
    // turned off above, a wide viewport would show gray past the map edges
    // instead of repeating the earth.
    function updateMinZoomForSize() {
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) return;
      const minZoomForWidth = Math.ceil(Math.log2(size.x / 256));
      const minZoomForHeight = Math.ceil(Math.log2(size.y / 256));
      const minZoom = Math.max(2, minZoomForWidth, minZoomForHeight);
      map.setMinZoom(minZoom);
      if (map.getZoom() < minZoom) map.setZoom(minZoom);
    }

    // The container's final size isn't always settled the instant Leaflet
    // initializes (especially behind a dynamic import) — without this,
    // fitBounds below can compute against a stale/zero size and zoom wrong.
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      updateMinZoomForSize();
    });
    resizeObserver.observe(containerRef.current);
    updateMinZoomForSize();

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    clubs.forEach((club) => {
      const marker = L.marker([club.latitude, club.longitude], { icon: pinIcon() }).addTo(map);
      marker.bindTooltip(quickBubbleHtml(club), {
        direction: "top",
        offset: [0, -18],
        className: "quick-bubble",
      });

      let longPressFired = false;
      let longPressTimer: ReturnType<typeof setTimeout> | null = null;
      const el = marker.getElement();
      if (el) {
        el.addEventListener(
          "touchstart",
          () => {
            longPressFired = false;
            longPressTimer = setTimeout(() => {
              longPressFired = true;
              marker.openTooltip();
            }, 450);
          },
          { passive: true }
        );
        el.addEventListener("touchend", () => {
          if (longPressTimer) clearTimeout(longPressTimer);
          if (longPressFired) marker.closeTooltip();
        });
      }

      marker.on("click", () => {
        if (longPressFired) {
          longPressFired = false;
          return;
        }
        onSelectClub(club.id);
      });

      markersRef.current.set(club.id, marker);
    });

    if (!hasFitBoundsRef.current && clubs.length > 0) {
      hasFitBoundsRef.current = true;
      map.invalidateSize();
      const bounds = L.latLngBounds(clubs.map((c) => [c.latitude, c.longitude] as [number, number]));
      map.fitBounds(bounds.pad(0.3), { maxZoom: 5, animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
