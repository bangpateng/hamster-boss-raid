import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { bossForWeek, nextBoss } from "./core/boss";
import { DAMAGE_PER_METER, type FeedSource } from "./core/feed";
import { pickFeed } from "./core/pickFeed";
import { initial, reduce, rollAttack } from "./core/raid";
import { sfx, setMuted as setSfxMuted } from "./core/sfx";
import { Arena, type Fx } from "./components/Arena";
import { WheelPanel } from "./components/WheelPanel";
import { ControlPanel } from "./components/ControlPanel";
import { Leaderboard } from "./components/Leaderboard";
import { EventLog } from "./components/EventLog";

const BOTS = ["Mochi", "Pip", "Nutty", "Biscuit"];
const COOLDOWN_MS = 1500;
const COMBO_WINDOW_MS = 4000;

function startBoss() {
  const boss = bossForWeek();
  const quick = new URLSearchParams(location.search).has("quick");
  return quick ? { ...boss, hp: Math.round(boss.hp * 0.05) } : boss;
}

export default function App() {
  const [{ feed, live }] = useState(pickFeed);
  const [source, setSource] = useState<FeedSource>(live ? "offline" : "demo");
  const [state, dispatch] = useReducer(reduce, undefined, () => initial(startBoss()));
  const [name, setName] = useState(() => localStorage.getItem("raid-name") || "You");
  const [combo, setCombo] = useState(0);
  const [cooling, setCooling] = useState(false);
  const [cdKey, setCdKey] = useState(0);
  const [fx, setFx] = useState<Fx[]>([]);
  const [shake, setShake] = useState(false);
  const [hitKey, setHitKey] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const lastHit = useRef(0);
  const fxId = useRef(0);
  const lastLog = useRef(0);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawn = useCallback((text: string, kind: Fx["kind"]) => {
    const id = ++fxId.current;
    const x = 30 + Math.random() * 40;
    setFx((p) => [...p.slice(-8), { id, text, kind, x }]);
    setHitKey((k) => k + 1);
    setTimeout(() => setFx((p) => p.filter((f) => f.id !== id)), 900);
  }, []);

  useEffect(
    () =>
      feed.subscribe((t) => {
        setSource(t.source);
        const perMeter = DAMAGE_PER_METER[t.source];
        dispatch({ type: "wheel", meters: t.meters, running: t.running, perMeter });
        if (t.running && t.meters > 0) {
          spawn(t.source === "live" ? `${t.meters.toFixed(1)} m` : `-${Math.round(t.meters * perMeter)}`, "wheel");
        }
      }),
    [feed, spawn],
  );

  useEffect(() => {
    if (live) return;
    const id = setInterval(() => {
      const who = BOTS[Math.floor(Math.random() * BOTS.length)];
      const { dmg, crit } = rollAttack(0);
      dispatch({ type: "hit", who, dmg, crit });
      spawn(`-${dmg}`, crit ? "crit" : "bot");
    }, 2200);
    return () => clearInterval(id);
  }, [spawn, live]);

  useEffect(() => {
    localStorage.setItem("raid-name", name);
  }, [name]);

  useEffect(() => {
    setSfxMuted(muted);
  }, [muted]);

  useEffect(() => {
    const top = state.log[0];
    if (!top || top.id === lastLog.current) return;
    lastLog.current = top.id;
    if (top.kind === "phase" && top.id !== 0) {
      setBanner(top.text);
      sfx.phase();
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setBanner(null), 2600);
    }
    if (top.kind === "win") sfx.win();
  }, [state.log]);

  const attack = () => {
    if (cooling || state.defeated) return;
    const now = Date.now();
    const nextCombo = now - lastHit.current < COMBO_WINDOW_MS ? combo + 1 : 0;
    lastHit.current = now;
    setCombo(nextCombo);
    const { dmg, crit } = rollAttack(nextCombo);
    dispatch({ type: "hit", who: name.trim() || "You", dmg, crit });
    spawn(`-${dmg}`, crit ? "crit" : "me");
    setShake(true);
    setTimeout(() => setShake(false), 220);
    if (crit) sfx.crit();
    else sfx.hit();
    setCooling(true);
    setCdKey((k) => k + 1);
    setTimeout(() => setCooling(false), COOLDOWN_MS);
  };

  const attackRef = useRef(attack);
  attackRef.current = attack;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "BUTTON") return;
      e.preventDefault();
      attackRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const you = name.trim() || "You";

  return (
    <main className="app">
      <header className="top">
        <h1>Squeek Raid</h1>
        <p>Every meter the hamster runs hurts the boss. Your squeaks finish it.</p>
      </header>

      <Arena
        state={state}
        fx={fx}
        shake={shake}
        hitKey={hitKey}
        banner={banner}
        onNext={() => {
          lastLog.current = 0;
          dispatch({ type: "reset", boss: nextBoss(state.boss) });
        }}
      />

      <div className="panels">
        <WheelPanel running={state.running} meters={state.wheelMeters} damage={state.wheelDamage} source={source} />
        <ControlPanel
          name={name}
          onName={setName}
          combo={combo}
          cooling={cooling}
          cdKey={cdKey}
          defeated={state.defeated}
          muted={muted}
          onAttack={attack}
          onMute={() => setMuted((m) => !m)}
        />
        <Leaderboard state={state} you={you} />
        <EventLog log={state.log} />
      </div>

      <footer className="foot">
        <span>UNOFFICIAL. NOT AFFILIATED WITH SQUEEKCHAIN.</span>
        <a href="https://x.com/naxweb3" target="_blank" rel="noopener noreferrer">
          Built by @naxweb3
        </a>
      </footer>
    </main>
  );
}
