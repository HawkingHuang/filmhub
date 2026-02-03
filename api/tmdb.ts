import type { IncomingMessage, ServerResponse } from "http";

const CACHE_CONTROL = "public, s-maxage=600, stale-while-revalidate=300";

const isValidPath = (path: string) => {
  if (!path.startsWith("/")) return false;
  if (path.includes("..")) return false;
  if (path.includes("://")) return false;
  return true;
};

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.writeHead(status);
  res.end(body);
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "Missing TMDB_API_KEY" });
  }

  const urlObj = new URL(req.url ?? "/", "http://localhost");
  const rawPath = urlObj.searchParams.get("path") ?? undefined;
  if (typeof rawPath !== "string" || !isValidPath(rawPath)) {
    return sendJson(res, 400, { error: "Invalid path" });
  }

  const outbound = new URL(`https://api.themoviedb.org/3${rawPath}`);
  urlObj.searchParams.forEach((value, key) => {
    if (key === "path") return;
    outbound.searchParams.append(key, value);
  });

  outbound.searchParams.set("api_key", apiKey);
  if (!outbound.searchParams.has("language")) outbound.searchParams.set("language", "en-US");

  try {
    const upstream = await fetch(outbound.toString());
    const body = await upstream.text();

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.setHeader("Content-Type", contentType);
    res.writeHead(upstream.status);
    res.end(body);
    return;
  } catch {
    return sendJson(res, 500, { error: "Upstream request failed" });
  }
}
