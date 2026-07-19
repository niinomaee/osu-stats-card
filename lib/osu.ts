export interface OsuStats {
  username: string;
  countryCode: string;
  globalRank: number | null;
  countryRank: number | null;
  pp: number;
  accuracy: number;
  playCount: number;
  level: number;
  avatarUrl: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
const statsCache = new Map<string, { data: OsuStats; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientId = process.env.OSU_CLIENT_ID;
  const clientSecret = process.env.OSU_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing OSU_CLIENT_ID or OSU_CLIENT_SECRET in env");
  }

  const res = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "public",
    }),
  });

  if (!res.ok) throw new Error("Failed to get osu! access token");
  const data = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export async function fetchOsuStats(
  username: string,
  mode: "osu" | "taiko" | "fruits" | "mania" = "osu"
): Promise<OsuStats> {
  const cacheKey = `${username.toLowerCase()}:${mode}`;
  const cached = statsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const token = await getAccessToken();

  const res = await fetch(
    `https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/${mode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) throw new Error(`osu! user "${username}" not found`);
  const user = await res.json();

  const stats: OsuStats = {
    username: user.username,
    countryCode: user.country_code,
    globalRank: user.statistics?.global_rank ?? null,
    countryRank: user.statistics?.country_rank ?? null,
    pp: Math.round(user.statistics?.pp ?? 0),
    accuracy: Number((user.statistics?.hit_accuracy ?? 0).toFixed(2)),
    playCount: user.statistics?.play_count ?? 0,
    level: user.statistics?.level?.current ?? 0,
    avatarUrl: user.avatar_url,
  };

  statsCache.set(cacheKey, { data: stats, expiresAt: Date.now() + CACHE_TTL_MS });

  return stats;
}
