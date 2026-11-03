import { useEffect, useState } from "react";
import type { FeedSource } from "../core/feed";
import { HAMSTER_A, HAMSTER_B, HAMSTER_PAL } from "../core/sprites";
import { Sprite } from "./Sprite";

interface Props {
  running: boolean;
  meters: number;
  damage: number;
  source: FeedSource;
}

const SOURCE_NOTE: Record<FeedSource, string> = {
  live: "Live from the Squeekchain hamster.",
  demo: "Demo feed. Set VITE_SQUEEK_API_URL for live data.",
  offline: "Live feed offline. Retrying.",
};

export function WheelPanel({ running, meters, damage, source }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setFrame((f) => 1 - f), 140);
    return () => clearInterval(id);
  }, [running]);

  return (
    <section className="panel">
      <h2 className="ptitle">The wheel</h2>
      <div className="wheelBox">
        <svg viewBox="0 0 200 200" className={`wheel${running ? "" : " idle"}`} aria-hidden="true">
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--line2)" strokeWidth="6" />
          <circle cx="100" cy="100" r="8" fill="var(--line2)" />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="100" y1="10" x2="100" y2="190" stroke="var(--line)" strokeWidth="3" transform={`rotate(${a} 100 100)`} />
          ))}
        </svg>
        <div className={`hamster${running ? "" : " idle"}`}>
          <Sprite rows={frame ? HAMSTER_B : HAMSTER_A} palette={HAMSTER_PAL} px={6} label="The hamster" />
        </div>
      </div>
      <dl className="stats">
        <div>
          <dt>Status</dt>
          <dd className={running ? "ok" : "bad"}>{running ? "Running" : "Napping"}</dd>
        </div>
        <div>
          <dt>Distance</dt>
          <dd>{meters.toFixed(1)} m</dd>
        </div>
        <div>
          <dt>Wheel damage</dt>
          <dd>{damage.toLocaleString()}</dd>
        </div>
      </dl>
      <p className={`chip ${source}`}>{SOURCE_NOTE[source]}</p>
    </section>
  );
}
