import { useMemo } from "react";
import type { RaidState } from "../core/raid";
import { SPRITES, TROPHY, bossPalette } from "../core/sprites";
import { Sprite } from "./Sprite";

export interface Fx {
  id: number;
  text: string;
  kind: "me" | "crit" | "bot" | "wheel";
  x: number;
}

interface Props {
  state: RaidState;
  fx: Fx[];
  shake: boolean;
  hitKey: number;
  banner: string | null;
  onNext: () => void;
}

function mood(ratio: number) {
  if (ratio > 0.75) return "Fresh";
  if (ratio > 0.5) return "Angry";
  if (ratio > 0.25) return "Enraged";
  return "Desperate";
}

const SEGMENTS = 40;

export function Arena({ state, fx, shake, hitKey, banner, onNext }: Props) {
  const { boss, hp, defeated, finisher } = state;
  const ratio = hp / boss.hp;
  const palette = useMemo(() => bossPalette(boss.color), [boss.color]);
  const filled = Math.ceil(ratio * SEGMENTS);
  const hpColor = ratio > 0.5 ? "var(--green)" : ratio > 0.25 ? "var(--amber)" : "var(--red)";

  return (
    <section className={`arena${ratio <= 0.25 && !defeated ? " rage" : ""}`}>
      <div className="arenaHead">
        <h2>{boss.name}</h2>
        <span className="bossTitle">{boss.title}</span>
        <span className={`mood ${defeated ? "done" : ratio <= 0.5 ? "hot" : ""}`}>{defeated ? "Defeated" : mood(ratio)}</span>
      </div>

      <div className={`stage${shake ? " shake" : ""}`}>
        <div className="boss">
          <div key={hitKey} className="flash">
            <Sprite rows={SPRITES[boss.id]} palette={palette} px={16} label={`${boss.name}, ${mood(ratio)}`} />
          </div>
        </div>
        {fx.map((f) => (
          <span key={f.id} className={`fx ${f.kind}`} style={{ left: `${f.x}%` }}>
            {f.text}
          </span>
        ))}
        {banner && <div className="banner">{banner}</div>}
        {defeated && (
          <div className="overlay">
            <Sprite rows={TROPHY} palette={{ k: "#1a1200", y: "#ffb23f" }} px={8} />
            <h3>Raid cleared</h3>
            <p>Final blow by {finisher}</p>
            <button className="btn" onClick={onNext}>
              Summon next boss
            </button>
          </div>
        )}
      </div>

      <div className="hpWrap">
        <div className="hp" role="progressbar" aria-valuemin={0} aria-valuemax={boss.hp} aria-valuenow={hp} aria-label="Boss health">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} style={i < filled ? { background: hpColor } : undefined} />
          ))}
        </div>
        <div className="hpText">
          <span>HP</span>
          <span>
            {hp.toLocaleString()} / {boss.hp.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
}
