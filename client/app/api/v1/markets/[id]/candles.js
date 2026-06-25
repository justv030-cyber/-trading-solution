import { NextResponse } from "next/server";
import { getMarketEngine } from "../../../../lib/engines.js";

const ALLOWED_TIMEFRAMES = new Set(["1m", "5m", "15m", "1h"]);

function parseIntOrNaN(v) {
  const n = typeof v === "string" ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

function err400(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function aggregateCandlesFrom5m(candles5m, timeframeSeconds) {
  const step5m = 300;
  if (timeframeSeconds === step5m) return candles5m;

  if (timeframeSeconds === 900) {
    const out = [];
    for (let i = 0; i < candles5m.length; i += 3) {
      const chunk = candles5m.slice(i, i + 3);
      if (chunk.length < 3) break;
      const t = chunk[0].t;
      const o = chunk[0].o;
      const c = chunk[chunk.length - 1].c;
      const h = Math.max(...chunk.map((x) => x.h));
      const l = Math.min(...chunk.map((x) => x.l));
      const v = chunk.reduce((s, x) => s + x.v, 0);
      out.push({ t, o, h, l, c, v });
    }
    return out;
  }

  if (timeframeSeconds === 3600) {
    const out = [];
    for (let i = 0; i < candles5m.length; i += 12) {
      const chunk = candles5m.slice(i, i + 12);
      if (chunk.length < 12) break;
      const t = chunk[0].t;
      const o = chunk[0].o;
      const c = chunk[chunk.length - 1].c;
      const h = Math.max(...chunk.map((x) => x.h));
      const l = Math.min(...chunk.map((x) => x.l));
      const v = chunk.reduce((s, x) => s + x.v, 0);
      out.push({ t, o, h, l, c, v });
    }
    return out;
  }

  if (timeframeSeconds === 60) {
    const out = [];
    for (const c of candles5m) {
      const perV = c.v / 5;
      for (let k = 0; k < 5; k++) {
        out.push({ t: c.t + k * 60, o: c.o, h: c.h, l: c.l, c: c.c, v: perV });
      }
    }
    return out;
  }

  return [];
}

export async function GET(req, { params }) {
  const id = params.id;
  const d = getMarketEngine().detail(id);
  if (!d) return new NextResponse("not found", { status: 404 });

  const url = new URL(req.url);
  const timeframe = url.searchParams.get("timeframe") ?? "5m";
  const limitRaw = url.searchParams.get("limit") ?? "100";

  if (!ALLOWED_TIMEFRAMES.has(timeframe)) {
    return err400(
      `Invalid timeframe. Allowed values: ${[...ALLOWED_TIMEFRAMES].join(", ")}`
    );
  }

  const limit = parseIntOrNaN(limitRaw);
  if (!Number.isFinite(limit) || limit <= 0) {
    return err400("Invalid limit. Must be a positive integer");
  }
  if (limit > 500) {
    return err400("Invalid limit. Max allowed is 500");
  }

  const timeframeSeconds =
    timeframe === "1m"
      ? 60
      : timeframe === "5m"
      ? 300
      : timeframe === "15m"
      ? 900
      : 3600;

  const candles5m = d.candles ?? [];
  const aggregated = aggregateCandlesFrom5m(candles5m, timeframeSeconds);
  const slice = aggregated.slice(Math.max(0, aggregated.length - limit));

  return NextResponse.json({
    id: d.id,
    pair: d.pair,
    base: d.base,
    quote: d.quote,
    timeframe,
    candles: slice,
    server_ts: Math.floor(Date.now() / 1000),
  });
}

