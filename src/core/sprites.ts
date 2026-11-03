export const SPRITES: Record<string, string[]> = {
  cheese: [
    ".....kkkkkk.....",
    "...kkyyyyyykk...",
    "..kyyyyyyyyyyk..",
    ".kyyyoyyyyyoyyk.",
    ".kyyyyyyyyyyyyk.",
    "kyyyywwyywwyyyyk",
    "kyyyyweyyewyyyyk",
    "kyoyyyyyyyyyyoyk",
    "kyyyyyyyyyyyyyyk",
    "kyyyykkkkkkyyyyk",
    "kyyyykrrrrkyyyyk",
    ".kyyyykkkkyyyyk.",
    ".kyoyyyyyyyyoyk.",
    "..kyyyyyyyyyyk..",
    "...kkyyyyyykk...",
    ".....kkkkkk.....",
  ],
  golem: [
    "..kkkkkkkkkkkk..",
    ".kyyyyyyyyyyyyk.",
    "kyyoyyyyyyyyoyyk",
    "kyyyyyyyyyyyyyyk",
    "kyywwyyyyyywwyyk",
    "kyywweyyyyewwyyk",
    "kyyyyyyyyyyyyyyk",
    "kyoyyyyyyyyyyoyk",
    "kyyyyyykkyyyyyyk",
    "kyyykkkkkkkkyyyk",
    "kyyykrrrrrrkyyyk",
    "kyyyykkkkkkyyyyk",
    "kyyoyyyyyyyyoyyk",
    "kyyyyyyyyyyyyyyk",
    ".kyyyyyyyyyyyyk.",
    "..kkkkkkkkkkkk..",
  ],
  cat: [
    ".kk..........kk.",
    ".kyk........kyk.",
    ".kyykkkkkkkkyyk.",
    ".kyyyyyyyyyyyyk.",
    "kyyyyyyyyyyyyyyk",
    "kyyywwyyyywwyyyk",
    "kyyyweyyyyewyyyk",
    "kyyyyyyyyyyyyyyk",
    "kyyyyyyppyyyyyyk",
    "kyyyyykyykyyyyyk",
    "kyyyyyykkyyyyyyk",
    "kyyyyyyyyyyyyyyk",
    ".kyyyyyyyyyyyyk.",
    "..kyyyyyyyyyyk..",
    "...kkkkkkkkkk...",
    "................",
  ],
};

export const HAMSTER_A = [
  "......kk.kk.",
  "..kkkkbkbbk.",
  ".kbbbbbbbbbk",
  "kbbbbbbbbebk",
  "kbwwwwbbbbpk",
  "kbwwwwwbbbbk",
  ".kbwwwwwbbk.",
  "..kkbbbbkk..",
  "..k.k..k.k..",
];

export const HAMSTER_B = [
  "......kk.kk.",
  "..kkkkbkbbk.",
  ".kbbbbbbbbbk",
  "kbbbbbbbbebk",
  "kbwwwwbbbbpk",
  "kbwwwwwbbbbk",
  ".kbwwwwwbbk.",
  "..kkbbbbkk..",
  "...k.kk.k...",
];

export const HAMSTER_PAL: Record<string, string> = {
  k: "#1a1208",
  b: "#e0a24a",
  w: "#fff1d0",
  e: "#111111",
  p: "#ff8fb3",
};

export const TROPHY = [
  "kkkkkkkk",
  "kyyyyyyk",
  "kyyyyyyk",
  ".kyyyyk.",
  "..kyyk..",
  "...kk...",
  "..kyyk..",
  ".kkkkkk.",
];

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function bossPalette(color: string): Record<string, string> {
  return {
    y: color,
    o: shade(color, -0.35),
    k: "#0b0f12",
    w: "#ffffff",
    e: "#111111",
    r: "#d9363e",
    p: "#ff8fb3",
  };
}
