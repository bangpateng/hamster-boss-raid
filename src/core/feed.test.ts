import assert from "node:assert/strict";
import { createLiveFeed, statusToTick } from "./feed";

// first poll sets the baseline: no damage from the existing total
let out = statusToTick(null, { freshness: "online", distanceMm: 7660550, speedMmPerSecond: 0 });
assert.ok(out);
assert.equal(out.tick.meters, 0);
assert.equal(out.tick.running, false);
assert.equal(out.distanceMm, 7660550);

// distance grows: meters = delta in mm / 1000
out = statusToTick(7660550, { freshness: "online", distanceMm: 7661350, speedMmPerSecond: 400 });
assert.ok(out);
assert.equal(out.tick.meters, 0.8);
assert.equal(out.tick.running, true);

// idle: no distance change, speed 0
out = statusToTick(7661350, { freshness: "online", distanceMm: 7661350, speedMmPerSecond: 0 });
assert.ok(out);
assert.equal(out.tick.running, false);
assert.equal(out.tick.meters, 0);

// stale data never counts as running
out = statusToTick(100, { freshness: "stale", distanceMm: 900, speedMmPerSecond: 500 });
assert.ok(out);
assert.equal(out.tick.running, false);
assert.equal(out.tick.meters, 0);

// a huge jump (counter reset or backfill) is ignored
out = statusToTick(0, { freshness: "online", distanceMm: 900_000_000, speedMmPerSecond: 10 });
assert.ok(out);
assert.equal(out.tick.meters, 0);

// a counter that goes backwards never deals negative damage
out = statusToTick(5000, { freshness: "online", distanceMm: 1000, speedMmPerSecond: 0 });
assert.ok(out);
assert.equal(out.tick.meters, 0);

// strings are accepted, junk is rejected
out = statusToTick(null, { distanceMm: "7660550" });
assert.ok(out);
assert.equal(out.distanceMm, 7660550);
assert.equal(statusToTick(null, { distanceMm: "n/a" }), null);
assert.equal(statusToTick(null, undefined), null);

// live feed: baseline, then a delta, then an error becomes "offline"
async function liveFeedFlow() {
  const bodies = [
    { measurement: { freshness: "online", distanceMm: 1000, speedMmPerSecond: 300 } },
    { measurement: { freshness: "online", distanceMm: 3000, speedMmPerSecond: 300 } },
  ];
  let i = 0;
  const fakeFetch = (async () => {
    if (i >= bodies.length) throw new Error("network down");
    return { ok: true, json: async () => bodies[i++] };
  }) as unknown as typeof fetch;

  const ticks: { meters: number; source: string }[] = [];
  const feed = createLiveFeed("https://example.test/", 20, fakeFetch);
  const stop = feed.subscribe((t) => ticks.push({ meters: t.meters, source: t.source }));
  await new Promise((r) => setTimeout(r, 120));
  stop();
  assert.equal(ticks[0].meters, 0);
  assert.equal(ticks[1].meters, 2);
  assert.equal(ticks[1].source, "live");
  assert.equal(ticks[ticks.length - 1].source, "offline");
}

liveFeedFlow().then(() => console.log("feed tests passed"));
