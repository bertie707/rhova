import type { NextConfig } from "next";

// Esri map tiles, Google Fonts, and Vercel Blob (club photos) are the only
// external hosts this app talks to — everything else is same-origin.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://server.arcgisonline.com https://*.arcgisonline.com https://*.public.blob.vercel-storage.com",
  "media-src 'self' https://*.public.blob.vercel-storage.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Lets phones/laptops on the same WiFi hit the dev server via LAN IP —
  // Next.js otherwise blocks dev-server requests from any origin but localhost.
  allowedDevOrigins: ["192.168.1.17", "192.168.1.28"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
