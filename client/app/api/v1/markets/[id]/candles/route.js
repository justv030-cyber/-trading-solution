export async function GET(req, { params }) {
  try {
    const { id } = params;

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "5m";
    const limitParam = searchParams.get("limit") || "100";

    const limit = parseInt(limitParam, 10);


    // 1. VALIDATION

    const allowedTimeframes = ["1m", "5m", "15m", "1h"];

    if (!allowedTimeframes.includes(timeframe)) {
      return Response.json(
        { error: "Invalid timeframe. Use 1m, 5m, 15m, or 1h" },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit <= 0) {
      return Response.json(
        { error: "Limit must be a positive number" },
        { status: 400 }
      );
    }

    if (limit > 500) {
      return Response.json(
        { error: "Limit cannot exceed 500" },
        { status: 400 }
      );
    }


    // 2. MOCK / SIMULATED CANDLE DATA

    const candles = generateCandles(id, timeframe, limit);

    // -----------------------------
    // 3. REs
    // -----------------------------
    return Response.json({
      market: id,
      timeframe,
      limit,
      candles
    });

  } catch (err) {
    return Response.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// -----------------------------
// Helper function (OHLCV generator)
// -----------------------------
function generateCandles(market, timeframe, limit) {
  const candles = [];

  let basePrice = market === "btc-usdt" ? 66400 : 100;

  for (let i = 0; i < limit; i++) {
    const open = basePrice + Math.random() * 50;
    const close = open + (Math.random() - 0.5) * 100;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    const volume = Math.random() * 10;

    candles.push({
      o: Number(open.toFixed(2)),
      h: Number(high.toFixed(2)),
      l: Number(low.toFixed(2)),
      c: Number(close.toFixed(2)),
      v: Number(volume.toFixed(2)),
      t: Date.now() - i * getTimeOffset(timeframe)
    });

    basePrice = close;
  }

  return candles.reverse();
}

// -----------------------------
// Timeframe converter
// -----------------------------
function getTimeOffset(timeframe) {
  switch (timeframe) {
    case "1m":
      return 60 * 1000;
    case "5m":
      return 5 * 60 * 1000;
    case "15m":
      return 15 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    default:
      return 5 * 60 * 1000;
  }
}