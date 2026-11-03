interface Props {
  name: string;
  onName: (n: string) => void;
  combo: number;
  cooling: boolean;
  cdKey: number;
  defeated: boolean;
  muted: boolean;
  onAttack: () => void;
  onMute: () => void;
}

export function ControlPanel({ name, onName, combo, cooling, cdKey, defeated, muted, onAttack, onMute }: Props) {
  const pips = Math.min(combo, 10);
  return (
    <section className="panel">
      <h2 className="ptitle">Your attack</h2>
      <label className="field">
        <span>Name</span>
        <input value={name} maxLength={16} onChange={(e) => onName(e.target.value)} />
      </label>
      <button className="btn" onClick={onAttack} disabled={cooling || defeated}>
        {defeated ? "Raid over" : cooling ? "Recovering" : "Squeak!"}
      </button>
      <div className="cdTrack">{cooling && <div key={cdKey} className="cdFill" />}</div>
      <div className="comboRow">
        <span>Combo</span>
        <div className="combo" role="img" aria-label={`Combo ${pips} of 10`}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={i < pips ? "on" : ""} />
          ))}
        </div>
      </div>
      <p className="hint">Press space to attack. Attack again within 4 seconds to keep the combo going: +2 damage per step.</p>
      <button className="ghost" onClick={onMute}>
        {muted ? "Sound off" : "Sound on"}
      </button>
    </section>
  );
}
