import type { IncomingMessage, ServerResponse } from "http";

const CACHE_CONTROL = "public, s-maxage=600, stale-while-revalidate=300";

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.writeHead(status);
  res.end(body);
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "Missing OMDB_API_KEY" });
  }

  const urlObj = new URL(req.url ?? "/", "http://localhost");
  const imdbId = urlObj.searchParams.get("i");
  if (typeof imdbId !== "string" || imdbId.trim().length === 0) {
    return sendJson(res, 400, { error: "Missing i (imdb id)" });
  }

  const outbound = new URL("https://www.omdbapi.com/");
  outbound.searchParams.set("i", imdbId);
  outbound.searchParams.set("apikey", apiKey);

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
