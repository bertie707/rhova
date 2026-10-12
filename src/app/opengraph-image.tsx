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
          background: "linear-gradient(135deg, #1c8c7c, #1e2a28)",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "serif",
            marginBottom: 28,
          }}
        >
          Rhova
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#eef2f0",
            fontFamily: "sans-serif",
            textAlign: "center",
            maxWidth: 880,
            lineHeight: 1.4,
          }}
        >
          Gap year placements worldwide, verified by a real phone call
        </div>
      </div>
    ),
    { ...size }
  );
}
