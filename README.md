# Hamster Boss Raid

A cooperative boss fight powered by the Squeekchain hamster. Every meter the hamster runs removes boss HP, and players add damage with squeak attacks and combos. When the hamster naps, the boss gets a breather.

## Run it

```bash
npm install
npm run dev
npm test
```

## How it plays

- Each week a boss appears (rotates through three). Boss HP is the raid's shared goal.
- Wheel damage: 1 meter run by the hamster = 10 damage (`METER_DAMAGE` in `src/core/raid.ts`).
- Squeak attack: 5 to 15 damage, 15% chance to crit for double, 1.5 second cooldown.
- Combo: attack again within 4 seconds to add up to +20 damage.
- Phases at 75%, 50%, and 25% HP change the boss's mood and post a line to the raid log.
- Defeat the boss to see who landed the final blow, then summon the next one.

Open `/?quick` for a short fight (boss has 5% of its HP). Press space to attack.

## Look and feel

Pixel art and CRT styling to match Squeekchain: sprites are drawn from text maps (`src/core/sprites.ts`), fonts are Press Start 2P and VT323 (bundled, no network needed), plus floating damage numbers, screen shake on your hits, phase banners, and small chiptune sounds (toggle in the attack panel).

## Structure

```
src/core/
  boss.ts        boss list, weekly rotation
  raid.ts        pure reducer: wheel ticks, hits, phases, victory
  raid.test.ts   tests for the reducer
  feed.ts        HamsterFeed interface + mock feed
  sprites.ts     pixel maps for bosses, hamster, trophy
  sfx.ts         tiny WebAudio sounds
src/components/  Arena, WheelPanel, ControlPanel, Leaderboard, EventLog, Sprite
src/App.tsx      wires feed, bots, and player input to the reducer
```

## Live hamster data

The game reads `GET {VITE_SQUEEK_API_URL}/v1/status` every 2 seconds:

- `measurement.distanceMm` is a running total. The first poll is only a baseline, after that every increase in distance becomes meters run (`statusToTick` in `src/core/feed.ts`).
- The hamster counts as running when `freshness` is `online` and speed or distance is moving.
- Live mode deals 1 damage per meter. Demo mode deals 10 per meter because the mock hamster is much faster. Both are in `DAMAGE_PER_METER`.
- If the API can't be reached, the wheel panel shows "Live feed offline. Retrying." and no wheel damage is dealt.

```bash
cp .env.example .env     # then set VITE_SQUEEK_API_URL
npm run dev              # add ?demo to the page URL to force the demo feed
```

The browser calls the API directly, so the API must allow cross-origin requests (CORS) from wherever the game is hosted. If it doesn't, proxy `/v1/status` through your host (for example a rewrite on Vercel or Netlify) and point `VITE_SQUEEK_API_URL` at your own domain.

## What is still simulated

- In demo mode the other raiders (Mochi, Pip, Nutty, Biscuit) are bots. In live mode the bots are off, so the leaderboard only shows you and the hamster.
- Real shared raids need a small server or a Discord/Telegram bot that runs the same `reduce` function, since `src/core` has no browser dependencies.

## Roadmap

- [x] Live hamster feed from /v1/status
- [ ] Use /v1/events (speed records, distance milestones) for boss events and bonus damage
- [ ] Shared raid state (server or Discord bot reusing `src/core`)
- [ ] Wallet sign-in (signed message, no transaction) so damage is tied to a wallet
- [ ] Weekly leaderboard and loot badges for top damage dealers
- [ ] Deploy and submit to Squeekchain Genesis
