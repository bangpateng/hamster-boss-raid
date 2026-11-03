import type { LogEntry } from "../core/raid";

export function EventLog({ log }: { log: LogEntry[] }) {
  return (
    <section className="panel">
      <h2 className="ptitle">Raid log</h2>
      <ul className="logList">
        {log.slice(0, 14).map((l) => (
          <li key={l.id} className={l.kind}>
            {l.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
