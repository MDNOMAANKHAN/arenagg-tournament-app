export const runtime = "edge";

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="arenaMark" x1="12" y1="8" x2="76" y2="82" gradientUnits="userSpaceOnUse">
      <stop stop-color="#19E0E9"/>
      <stop offset="1" stop-color="#1685F7"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="18" fill="#061426"/>
  <g fill="url(#arenaMark)">
    <path d="M48 9 61 18 81 51 56 40 48 28 40 40 15 51 35 18 48 9Z"/>
    <path d="M39 45 28 57 42 85 42 56 48 48 54 56 54 85 68 57 57 45 48 50 39 45Z"/>
  </g>
</svg>`;

export async function GET() {
  return new Response(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
