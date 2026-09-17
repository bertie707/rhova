"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // A cached service worker fights with Turbopack's dev-time chunk
      // fetching (HMR), so only ever register in production and make sure
      // dev doesn't leave a stale one installed from an earlier prod build.
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
      }
      return;
    }

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // A worker already sitting in "waiting" (installed while no tab was open).
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
          setUpdateAvailable(true);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {
        // Installability is a nice-to-have — silently skip if it fails.
      });

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-3 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
      <span>A new version is ready.</span>
      <button
        onClick={() => waitingWorker?.postMessage("SKIP_WAITING")}
        className="rounded-full bg-coral px-3 py-1 font-semibold hover:bg-coral-deep"
      >
        Refresh
      </button>
    </div>
  );
}
