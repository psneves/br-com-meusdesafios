import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Meus Desafios — Consistência vira resultado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* App icon circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Meus Desafios
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.85)",
            fontWeight: 400,
          }}
        >
          Consistência vira resultado.
        </div>

        {/* Challenge pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Água", "Dieta", "Sono", "Exercício"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
