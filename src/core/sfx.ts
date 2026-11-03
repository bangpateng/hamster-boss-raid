let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.04) {
  if (muted) return;
  try {
    if (!ctx) ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    // audio is optional
  }
}

export const sfx = {
  hit: () => blip(660),
  crit: () => {
    blip(880);
    setTimeout(() => blip(1320), 70);
  },
  phase: () => blip(160, 0.3, "sawtooth", 0.05),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.14), i * 120));
  },
};
