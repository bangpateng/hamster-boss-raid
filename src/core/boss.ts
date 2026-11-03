export interface Phase {
  at: number;
  text: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  hp: number;
  color: string;
  phases: Phase[];
}

export const BOSSES: Boss[] = [
  {
    id: "cheese",
    name: "Gorgonzilla",
    title: "The Great Cheese Wheel",
    hp: 3000,
    color: "#f0b429",
    phases: [
      { at: 0.75, text: "Gorgonzilla rolls faster. The floor starts to smell." },
      { at: 0.5, text: "Gorgonzilla is half melted and furious." },
      { at: 0.25, text: "Enraged. Gorgonzilla goes full mold." },
    ],
  },
  {
    id: "golem",
    name: "Seedrock",
    title: "Sunflower Seed Golem",
    hp: 3600,
    color: "#8a6d3b",
    phases: [
      { at: 0.75, text: "Seedrock sheds a layer of shells." },
      { at: 0.5, text: "Seedrock's core cracks open." },
      { at: 0.25, text: "Enraged. Seedrock throws everything it has." },
    ],
  },
  {
    id: "cat",
    name: "Sir Whiskerdoom",
    title: "Cat of Doom",
    hp: 4200,
    color: "#6b7280",
    phases: [
      { at: 0.75, text: "Sir Whiskerdoom starts to stalk the wheel." },
      { at: 0.5, text: "Sir Whiskerdoom pounces, and misses." },
      { at: 0.25, text: "Enraged. Sir Whiskerdoom is out of lives." },
    ],
  },
];

export function bossForWeek(date: Date = new Date()): Boss {
  const week = Math.floor(date.getTime() / (7 * 24 * 3600 * 1000));
  return BOSSES[week % BOSSES.length];
}

export function nextBoss(current: Boss): Boss {
  const i = BOSSES.findIndex((b) => b.id === current.id);
  return BOSSES[(i + 1) % BOSSES.length];
}
