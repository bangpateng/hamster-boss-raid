import type { RaidState } from "../core/raid";

export function Leaderboard({ state, you }: { state: RaidState; you: string }) {
  const rows = [
    ...Object.values(state.players).map((p) => ({ name: p.name, damage: p.damage, wheel: false })),
    { name: "The hamster", damage: state.wheelDamage, wheel: true },
  ].sort((a, b) => b.damage - a.damage);
  const max = Math.max(1, ...rows.map((r) => r.damage));

  return (
    <section className="panel">
      <h2 className="ptitle">Damage dealt</h2>
      <ol className="lbList">
        {rows.map((r, i) => (
          <li key={r.name} className={`${r.name === you ? "me" : ""}${r.wheel ? " wheelRow" : ""}`}>
            <span className="rank">{i + 1}</span>
            <span className="lbName">{r.name}</span>
            <span className="lbBar">
              <span style={{ width: `${(r.damage / max) * 100}%` }} />
            </span>
            <strong>{r.damage.toLocaleString()}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
