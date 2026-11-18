import { ImageResponse } from "next/og";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";
export const alt = "ARENAGG shield A logo";

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
          background: "#07152b",
        }}
      >
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <path
            d="M44 5 75 17v23c0 20-12.5 34-31 42C25.5 74 13 60 13 40V17L44 5Z"
            fill="#102C50"
            stroke="#2789D9"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M26 60 39 27h10l13 33H51l-2.5-6.5H39L36.5 60H26Zm16-14h5l-2.5-7-2.5 7Z"
            fill="#EAF3FF"
          />
          <path
            d="m52 31 9 9-9 9"
            stroke="#45D7FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
