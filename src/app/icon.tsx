import { ImageResponse } from "next/og";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";
export const alt = "ARENAGG esports mark";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "96px",
          height: "96px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#061426",
        }}
      >
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <defs>
            <linearGradient id="arenaMark" x1="12" y1="8" x2="76" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#19E0E9" />
              <stop offset="1" stopColor="#1685F7" />
            </linearGradient>
          </defs>
          <path
            d="M44 8 57 17 76 48 52 38 44 27 36 38 12 48 31 17 44 8Z"
            fill="url(#arenaMark)"
          />
          <path
            d="M36 43 25 54 39 82 39 53 44 46 49 53 49 82 63 54 52 43 44 48 36 43Z"
            fill="url(#arenaMark)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
