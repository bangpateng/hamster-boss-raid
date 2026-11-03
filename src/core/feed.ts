export type FeedSource = "live" | "demo" | "offline";

export interface WheelTick {
  meters: number;
  running: boolean;
  source: FeedSource;
}

export interface HamsterFeed {
  subscribe(onTick: (t: WheelTick) => void): () => void;
}

// Wheel damage per meter. The demo feed moves fast, the real hamster is slow.
export const DAMAGE_PER_METER: Record<FeedSource, number> = {
  demo: 10,
  live: 1,
  offline: 1,
};

export function createMockFeed(intervalMs = 1500): HamsterFeed {
  return {
    subscribe(onTick) {
      let napTicks = 0;
      const id = setInterval(() => {
        if (napTicks > 0) {
          napTicks--;
          onTick({ meters: 0, running: false, source: "demo" });
          return;
        }
        if (Math.random() < 0.04) {
          napTicks = 3;
          onTick({ meters: 0, running: false, source: "demo" });
          return;
        }
        onTick({ meters: 0.4 + Math.random() * 0.8, running: true, source: "demo" });
      }, intervalMs);
      return () => clearInterval(id);
    },
  };
}

// Shape of GET /v1/status that this game reads. Everything else is ignored.
export interface StatusMeasurement {
  freshness?: string;
  coreStatus?: string;
  distanceMm?: number | string;
  speedMmPerSecond?: number | string;
}

const MAX_JUMP_M = 500;

export function statusToTick(
  prevDistanceMm: number | null,
  m: StatusMeasurement | undefined,
): { tick: WheelTick; distanceMm: number } | null {
  const distanceMm = Number(m?.distanceMm);
  if (!m || !Number.isFinite(distanceMm)) return null;

  const speed = Number(m.speedMmPerSecond);
  const online = m.freshness === undefined || m.freshness === "online";

  if (prevDistanceMm === null) {
    return { distanceMm, tick: { meters: 0, running: online && speed > 0, source: "live" } };
  }

  let meters = Math.max(0, distanceMm - prevDistanceMm) / 1000;
  if (meters > MAX_JUMP_M) meters = 0;
  const running = online && (speed > 0 || meters > 0);
  return { distanceMm, tick: { meters: running ? meters : 0, running, source: "live" } };
}

export function createLiveFeed(
  baseUrl: string,
  intervalMs = 2000,
  fetchImpl: typeof fetch = (...a) => fetch(...a),
): HamsterFeed {
  const url = `${baseUrl.replace(/\/$/, "")}/v1/status`;
  return {
    subscribe(onTick) {
      let prev: number | null = null;
      let stopped = false;
      const poll = async () => {
        try {
          const res = await fetchImpl(url);
          if (!res.ok) throw new Error(`status ${res.status}`);
          const body = (await res.json()) as { measurement?: StatusMeasurement };
          const out = statusToTick(prev, body.measurement);
          if (!out) throw new Error("unexpected response");
          prev = out.distanceMm;
          if (!stopped) onTick(out.tick);
        } catch {
          if (!stopped) onTick({ meters: 0, running: false, source: "offline" });
        }
      };
      poll();
      const id = setInterval(poll, intervalMs);
      return () => {
        stopped = true;
        clearInterval(id);
      };
    },
  };
}
