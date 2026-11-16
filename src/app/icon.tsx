import { ImageResponse } from "next/og";

export const size = {
  width: 96,
  height: 96,
};

export const contentType = "image/png";
export const alt = "ARENAGG";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
          background: "#08172D",
          border: "3px solid #287FFB",
          color: "#FFFFFF",
          fontSize: 62,
          fontWeight: 900,
          letterSpacing: -5,
          fontFamily: "Arial",
        }}
      >
        A
        <span
          style={{
            color: "#45D7FF",
            fontSize: 26,
            marginLeft: -2,
            marginTop: -30,
          }}
        >
          ›
        </span>
      </div>
    ),
    {
      ...size,
    },
  );
}
