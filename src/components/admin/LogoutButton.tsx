"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Best-effort — if we're offline the cookie can't be cleared server-side,
      // but we still send the user to the login screen locally.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-50"
    >
      {loggingOut ? "Logging out…" : "Log out"}
    </button>
  );
}
