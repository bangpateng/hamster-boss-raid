import assert from "node:assert/strict";
import { BOSSES } from "./boss";
import { initial, reduce, rollAttack, METER_DAMAGE } from "./raid";

const boss = BOSSES[0];
let s = initial(boss);

s = reduce(s, { type: "wheel", meters: 2, running: true });
assert.equal(s.hp, boss.hp - 2 * METER_DAMAGE);
assert.equal(s.wheelDamage, 2 * METER_DAMAGE);

// small live-sized increments add up instead of rounding away
let t = initial(boss);
for (let i = 0; i < 10; i++) t = reduce(t, { type: "wheel", meters: 0.3, running: true, perMeter: 1 });
assert.equal(t.wheelDamage, 3);
assert.equal(t.hp, boss.hp - 3);

s = reduce(s, { type: "wheel", meters: 0, running: false });
assert.equal(s.running, false);
const hpBefore = s.hp;
s = reduce(s, { type: "wheel", meters: 0, running: false });
assert.equal(s.hp, hpBefore);

s = reduce(s, { type: "hit", who: "Pip", dmg: 50, crit: false });
assert.equal(s.players.Pip.damage, 50);
assert.equal(s.players.Pip.hits, 1);

const phaseCountBefore = s.log.filter((l) => l.kind === "phase").length;
s = reduce(s, { type: "hit", who: "Pip", dmg: Math.round(boss.hp * 0.3), crit: false });
assert.equal(s.log.filter((l) => l.kind === "phase").length, phaseCountBefore + 1);

s = reduce(s, { type: "hit", who: "Mochi", dmg: boss.hp, crit: true });
assert.equal(s.hp, 0);
assert.equal(s.defeated, true);
assert.equal(s.finisher, "Mochi");

const after = reduce(s, { type: "hit", who: "Pip", dmg: 10, crit: false });
assert.equal(after, s);

const r = rollAttack(0, () => 0);
assert.equal(r.crit, true);
assert.equal(r.dmg, 10);
const big = rollAttack(20, () => 0.99);
assert.equal(big.crit, false);
assert.equal(big.dmg, 15 + 20);

console.log("raid tests passed");
