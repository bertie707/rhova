import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#eef2f0",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#ff6b4a",
            fontFamily: "serif",
            marginBottom: 20,
          }}
        >
          Rhova
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#1e2a28",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 28,
          }}
        >
          List your club for free
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#5b6864",
            fontFamily: "sans-serif",
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Get found by gap year travellers looking for a club abroad — takes a few minutes, no cost
        </div>
      </div>
    ),
    { ...size }
  );
}
