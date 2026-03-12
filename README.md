# codex-sandbox
Used for random projects using codex assist tool.

## Repository layout
Each game has its own dedicated top-level folder.

- `snake/`
- `superman-64-2d/`

## Snake
A minimal classic Snake implementation (grid movement, growth, food spawn, score, game-over, pause, restart).

### Run
1. From `C:\GitHub\codex-sandbox`, start a static server (example):
   `python -m http.server 8000`
2. Open `http://localhost:8000/snake/` in a browser.

### Controls
- Keyboard: Arrow keys or `W/A/S/D`
- Pause/Resume: `P` key or `Pause` button
- Restart: `Restart` button
- On-screen directional buttons are included for touch/mobile play.

### Manual verification checklist
- Snake moves one cell per tick on a fixed grid.
- Arrow keys and WASD change direction, with no direct 180 turns.
- Eating food grows snake by one segment and increments score.
- Food never spawns on snake body.
- Hitting wall or snake body ends game and shows `Game Over`.
- `Pause` freezes movement and `Resume` continues.
- `Restart` resets score, snake, food, and game-over state.

### Tests
No test runner/tooling exists in this repo currently, so automated tests were not added.
Core game logic is isolated in `snake/src/snake-logic.js` for easy future unit testing.

## Superman 64 2D
A standalone browser game that reimagines Superman 64 as a much friendlier 2D arcade rescue mission.

### Run
1. Double-click `superman-64-2d\Play Superman 64 2D.bat`.
2. Keep the black terminal window open while you play.
3. Your browser should open the game automatically.

If that does not work:
1. From `C:\GitHub\codex-sandbox`, run `python -m http.server 8000` or `py -m http.server 8000`.
2. Open `http://localhost:8000/superman-64-2d/` in a browser.

### Controls
- Move: Arrow keys or `W/A/S/D`
- Boost: `Shift`
- Heat Vision: `Space`
- Pause: `P`
- Restart: `Restart` button

### Goal
- Rescue 5 falling civilians.
- Destroy 6 drones.
- Use ring routes to restore city health and solar energy.

### Tests
`node --check superman-64-2d/src/game.js`
