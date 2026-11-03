import type { Boss } from "./boss";

export const METER_DAMAGE = 10;

export interface Player {
  name: string;
  damage: number;
  hits: number;
}

export type LogKind = "hit" | "crit" | "wheel" | "phase" | "win";

export interface LogEntry {
  id: number;
  kind: LogKind;
  text: string;
}

export interface RaidState {
  boss: Boss;
  hp: number;
  wheelDamage: number;
  wheelFrac: number;
  wheelMeters: number;
  running: boolean;
  players: Record<string, Player>;
  log: LogEntry[];
  nextId: number;
  defeated: boolean;
  finisher: string | null;
}

export type Action =
  | { type: "wheel"; meters: number; running: boolean; perMeter?: number }
  | { type: "hit"; who: string; dmg: number; crit: boolean }
  | { type: "reset"; boss: Boss };

export function initial(boss: Boss): RaidState {
  return {
    boss,
    hp: boss.hp,
    wheelDamage: 0,
    wheelFrac: 0,
    wheelMeters: 0,
    running: true,
    players: {},
    log: [{ id: 0, kind: "phase", text: `${boss.name}, ${boss.title}, appears. Keep the wheel turning.` }],
    nextId: 1,
    defeated: false,
    finisher: null,
  };
}

export function rollAttack(combo: number, rng: () => number = Math.random) {
  const base = 5 + Math.floor(rng() * 11);
  const crit = rng() < 0.15;
  const dmg = Math.round((base + Math.min(combo, 10) * 2) * (crit ? 2 : 1));
  return { dmg, crit };
}

function push(s: RaidState, entries: Omit<LogEntry, "id">[]): Pick<RaidState, "log" | "nextId"> {
  let id = s.nextId;
  const added = entries.map((e) => ({ ...e, id: id++ }));
  return { log: [...added.reverse(), ...s.log].slice(0, 30), nextId: id };
}

function dealDamage(s: RaidState, amount: number, who: string): RaidState {
  if (s.defeated || amount <= 0) return s;
  const prev = s.hp;
  const hp = Math.max(0, prev - amount);
  const entries: Omit<LogEntry, "id">[] = [];
  for (const p of s.boss.phases) {
    const line = p.at * s.boss.hp;
    if (prev > line && hp <= line) entries.push({ kind: "phase", text: p.text });
  }
  const defeated = hp === 0;
  if (defeated) entries.push({ kind: "win", text: `${s.boss.name} is defeated. Final blow: ${who}.` });
  return { ...s, hp, defeated, finisher: defeated ? who : s.finisher, ...push(s, entries) };
}

export function reduce(s: RaidState, a: Action): RaidState {
  switch (a.type) {
    case "reset":
      return initial(a.boss);
    case "wheel": {
      if (!a.running) {
        const changed = s.running;
        const next = { ...s, running: false };
        return changed ? { ...next, ...push(s, [{ kind: "wheel", text: "The hamster stopped. No wheel damage." }]) } : next;
      }
      const total = s.wheelFrac + a.meters * (a.perMeter ?? METER_DAMAGE);
      const dmg = Math.floor(total + 1e-9);
      const woke = !s.running;
      let next: RaidState = {
        ...s,
        running: true,
        wheelMeters: s.wheelMeters + a.meters,
        wheelDamage: s.wheelDamage + dmg,
        wheelFrac: Math.max(0, total - dmg),
      };
      if (woke) next = { ...next, ...push(next, [{ kind: "wheel", text: "The hamster is running again." }]) };
      return dealDamage(next, dmg, "The hamster");
    }
    case "hit": {
      if (s.defeated) return s;
      const prev = s.players[a.who] ?? { name: a.who, damage: 0, hits: 0 };
      const players = { ...s.players, [a.who]: { ...prev, damage: prev.damage + a.dmg, hits: prev.hits + 1 } };
      const withPlayer = { ...s, players };
      const logged = {
        ...withPlayer,
        ...push(withPlayer, [
          { kind: a.crit ? "crit" : "hit", text: `${a.who} ${a.crit ? "lands a critical hit for" : "hits for"} ${a.dmg}` },
        ]),
      };
      return dealDamage(logged, a.dmg, a.who);
    }
  }
}
