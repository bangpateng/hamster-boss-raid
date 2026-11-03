interface Props {
  rows: string[];
  palette: Record<string, string>;
  px: number;
  label?: string;
}

export function Sprite({ rows, palette, px, label }: Props) {
  const w = rows[0].length;
  const h = rows.length;
  const rects: JSX.Element[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === ".") {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === c) run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={palette[c] ?? "#f0f"} />);
      x += run;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * px}
      height={h * px}
      style={{ maxWidth: "100%", height: "auto" }}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}
