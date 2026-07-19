const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt < now) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }

    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
        return true;
    }

    return false;
}