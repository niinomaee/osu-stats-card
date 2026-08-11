import type { OsuStats } from "./osu.js";

function formatRank(rank: number | null): string {
  return rank ? `#${rank.toLocaleString("en-US")}` : "Unranked";
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return char;
    }
  });
}

export function renderOsuCard(stats: OsuStats): string {
  return `
<svg width="420" height="180" viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1025"/>
      <stop offset="100%" stop-color="#2d1b3d"/>
    </linearGradient>
  </defs>
  <rect width="420" height="180" rx="16" fill="url(#bg)" stroke="#ff6fa5" stroke-width="2"/>

  <text x="24" y="36" font-family="Verdana, sans-serif" font-size="18" font-weight="bold" fill="#ff9ecb">
    ${escapeXml(stats.username)}'s osu! Stats
  </text>

  <text x="24" y="66" font-family="Verdana, sans-serif" font-size="13" fill="#e0d0f0">Global Rank: ${formatRank(stats.globalRank)}</text>
  <text x="24" y="88" font-family="Verdana, sans-serif" font-size="13" fill="#e0d0f0">Country Rank: ${formatRank(stats.countryRank)} (${escapeXml(stats.countryCode)})</text>
  <text x="24" y="110" font-family="Verdana, sans-serif" font-size="13" fill="#e0d0f0">PP: ${stats.pp.toLocaleString("en-US")}</text>
  <text x="24" y="132" font-family="Verdana, sans-serif" font-size="13" fill="#e0d0f0">Accuracy: ${stats.accuracy}%</text>
  <text x="24" y="154" font-family="Verdana, sans-serif" font-size="13" fill="#e0d0f0">Play Count: ${stats.playCount.toLocaleString("en-US")} (Lv.${stats.level})</text>
</svg>`.trim();
}