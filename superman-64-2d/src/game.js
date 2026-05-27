const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const cityHealthValue = document.getElementById("cityHealthValue");
const cityHealthFill = document.getElementById("cityHealthFill");
const energyValue = document.getElementById("energyValue");
const energyFill = document.getElementById("energyFill");
const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const rescuesValue = document.getElementById("rescuesValue");
const dronesValue = document.getElementById("dronesValue");
const announcerEl = document.getElementById("announcer");
const statusValue = document.getElementById("statusValue");
const objectiveValue = document.getElementById("objectiveValue");
const touchButtons = document.querySelectorAll("[data-input]");

const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const WORLD_WIDTH = 3200;
const GROUND_Y = 492;
const MISSION_TIME = 180;
const RESCUE_GOAL = 5;
const DRONE_GOAL = 6;

const keysDown = {
  up: false,
  down: false,
  left: false,
  right: false,
  boost: false,
  fire: false
};

const keyMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
  Shift: "boost",
  " ": "fire"
};

function resetInputs() {
  Object.keys(keysDown).forEach((key) => {
    keysDown[key] = false;
  });
  touchButtons.forEach((button) => button.classList.remove("active"));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function rectContainsCircle(rect, circle) {
  return (
    circle.x + circle.radius >= rect.x &&
    circle.x - circle.radius <= rect.x + rect.width &&
    circle.y + circle.radius >= rect.y &&
    circle.y - circle.radius <= rect.y + rect.height
  );
}

function createClouds() {
  return Array.from({ length: 18 }, (_, index) => ({
    x: index * 210 + randomRange(-80, 60),
    y: randomRange(40, 210),
    size: randomRange(38, 84),
    alpha: randomRange(0.08, 0.18)
  }));
}

function createBuildings() {
  const buildings = [];
  let x = 0;

  while (x < WORLD_WIDTH) {
    let width = randomInt(88, 160);
    let height = randomInt(100, 300);

    if (x < 160) {
      width = 78;
      height = randomInt(90, 160);
    }

    if (x >= 180 && x <= 360) {
      width = 180;
      height = 260;
    }

    if (x + width > WORLD_WIDTH) {
      width = WORLD_WIDTH - x;
    }

    const top = GROUND_Y - height;
    const accent = randomRange(0.35, 0.75);
    buildings.push({
      x,
      width,
      height,
      top,
      color: `rgba(${Math.floor(20 + accent * 40)}, ${Math.floor(
        34 + accent * 50
      )}, ${Math.floor(70 + accent * 55)}, 1)`
    });

    x += width + randomInt(10, 24);
  }

  return buildings;
}

function createSafeZone() {
  return {
    x: 212,
    y: GROUND_Y - 260 + 18,
    width: 116,
    height: 30
  };
}

function createPlayer() {
  return {
    x: 270,
    y: 150,
    vx: 0,
    vy: 0,
    radius: 22,
    facing: 1,
    carryingId: null
  };
}

function createState() {
  return {
    phase: "intro",
    timeRemaining: MISSION_TIME,
    cityHealth: 100,
    energy: 100,
    score: 0,
    combo: 0,
    comboTimer: 0,
    rescues: 0,
    dronesCleared: 0,
    civiliansLost: 0,
    chainCount: 0,
    player: createPlayer(),
    safeZone: createSafeZone(),
    buildings: createBuildings(),
    clouds: createClouds(),
    civilians: [],
    drones: [],
    particles: [],
    ringRoute: null,
    ringCooldown: 0.2,
    beam: null,
    cameraX: 0,
    screenShake: 0,
    statusText: "Ready",
    objectiveText:
      "Race the ring route, scoop up falling civilians, and keep the drone swarm off Metropolis.",
    announcer: {
      text: "Press Start Mission to launch over Metropolis.",
      color: "#ffd662",
      timer: 99
    },
    spawnTimers: {
      civilian: 1.5,
      drone: 4.2
    },
    nextId: 1
  };
}

let state = createState();
let lastTimestamp = performance.now();

function setAnnouncer(text, color = "#ffd662", duration = 1.9) {
  state.announcer = { text, color, timer: duration };
}

function boostCombo(amount) {
  state.combo = clamp(state.combo + amount, 0, 20);
  state.comboTimer = 4.2;
}

function breakCombo() {
  state.combo = 0;
  state.comboTimer = 0;
}

function addScore(base) {
  const multiplier = 1 + Math.min(2, state.combo * 0.1);
  const gained = Math.round(base * multiplier);
  state.score += gained;
  return gained;
}

function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i += 1) {
    const angle = randomRange(0, Math.PI * 2);
    const force = randomRange(speed * 0.35, speed);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      life: randomRange(0.35, 0.8),
      maxLife: randomRange(0.35, 0.8),
      size: randomRange(2, 6),
      color
    });
  }
}

function getBuildingForX(x) {
  return state.buildings.find((building) => x >= building.x && x <= building.x + building.width);
}

function createCivilian() {
  const spawnX = randomRange(520, WORLD_WIDTH - 180);
  const building = getBuildingForX(spawnX);
  const top = building ? building.top : GROUND_Y - 160;

  return {
    id: state.nextId++,
    x: spawnX,
    y: top - randomRange(40, 80),
    vx: randomRange(-18, 18),
    vy: randomRange(20, 45),
    radius: 14,
    status: "falling"
  };
}

function createDrone() {
  const fromLeft = Math.random() < 0.5;
  const spawnX = fromLeft ? -80 : WORLD_WIDTH + 80;
  const targetX = randomRange(420, WORLD_WIDTH - 200);
  const targetBuilding = getBuildingForX(targetX);
  const anchorY = targetBuilding ? targetBuilding.top - randomRange(80, 130) : 220;

  return {
    id: state.nextId++,
    x: spawnX,
    y: randomRange(90, 240),
    vx: 0,
    vy: 0,
    radius: 16,
    hp: 70,
    targetX,
    targetY: anchorY,
    fireTimer: randomRange(1.4, 2.2),
    phase: "approach",
    drift: randomRange(0, Math.PI * 2)
  };
}

function createRingRoute() {
  const forward = Math.random() < 0.5 ? -1 : 1;
  const anchorX = clamp(
    state.player.x + forward * randomRange(260, 720),
    220,
    WORLD_WIDTH - 220
  );
  const anchorY = randomRange(110, 240);
  const rings = [];

  for (let i = 0; i < 6; i += 1) {
    const offset = (i - 2.5) * 112 * forward;
    rings.push({
      x: clamp(anchorX + offset, 160, WORLD_WIDTH - 160),
      y: clamp(anchorY + Math.sin(i * 0.85 + (forward > 0 ? 0.4 : 1.2)) * 95, 90, 330),
      radius: 28
    });
  }

  return {
    rings,
    index: 0,
    timer: 24
  };
}

function resetGame(startPlaying = false) {
  resetInputs();
  state = createState();
  if (startPlaying) {
    startMission();
  } else {
    syncHud();
  }
}

function startMission() {
  if (state.phase === "playing") {
    return;
  }

  resetInputs();

  if (state.phase === "won" || state.phase === "lost") {
    state = createState();
  }

  state.phase = "playing";
  state.statusText = "In Flight";
  state.objectiveText =
    "Follow the glowing ring route, catch civilians before they hit the street, and burn down drones.";
  setAnnouncer("Launch! The city is live and the first ring route is powering up.");
}

function togglePause() {
  if (state.phase === "intro") {
    return;
  }

  if (state.phase === "playing") {
    state.phase = "paused";
    state.statusText = "Paused";
    setAnnouncer("Mission on hold.");
    return;
  }

  if (state.phase === "paused") {
    state.phase = "playing";
    state.statusText = "In Flight";
    setAnnouncer("Back in the air.");
  }
}

function getInputState() {
  return {
    up: keysDown.up,
    down: keysDown.down,
    left: keysDown.left,
    right: keysDown.right,
    boost: keysDown.boost,
    fire: keysDown.fire
  };
}

function updatePlayer(dt) {
  const input = getInputState();
  const player = state.player;
  const moveX = Number(input.right) - Number(input.left);
  const moveY = Number(input.down) - Number(input.up);
  const length = Math.hypot(moveX, moveY) || 1;
  const activeBoost = input.boost && state.energy > 0.2;
  const acceleration = activeBoost ? 1160 : 820;
  const topSpeed = activeBoost ? 520 : 340;
  const drag = input.fire ? 0.985 : 0.972;

  player.vx += (moveX / length) * acceleration * dt;
  player.vy += (moveY / length) * acceleration * dt;

  player.vx *= Math.pow(drag, dt * 60);
  player.vy *= Math.pow(drag, dt * 60);

  if (moveX === 0 && moveY === 0) {
    player.vx *= Math.pow(0.92, dt * 60);
    player.vy *= Math.pow(0.92, dt * 60);
  }

  const speed = Math.hypot(player.vx, player.vy);
  if (speed > topSpeed) {
    const scale = topSpeed / speed;
    player.vx *= scale;
    player.vy *= scale;
  }

  if (moveX !== 0) {
    player.facing = Math.sign(moveX);
  }

  player.x = clamp(player.x + player.vx * dt, 40, WORLD_WIDTH - 40);
  player.y = clamp(player.y + player.vy * dt, 60, GROUND_Y - 30);

  if (activeBoost) {
    state.energy = Math.max(0, state.energy - 16 * dt);
    spawnParticles(player.x - player.facing * 18, player.y + 6, "#ffdd88", 1, 45);
  } else {
    state.energy = Math.min(100, state.energy + 9.5 * dt);
  }

  updateHeatVision(dt, input.fire);
}

function findBeamTarget() {
  const player = state.player;
  let bestDrone = null;
  let bestScore = Infinity;

  for (const drone of state.drones) {
    const dx = drone.x - player.x;
    const dy = drone.y - player.y;
    const aheadEnough = player.facing > 0 ? dx >= -20 : dx <= 20;
    const dist = Math.hypot(dx, dy);
    if (!aheadEnough || dist > 520) {
      continue;
    }

    const score = dist + Math.abs(dy) * 0.35;
    if (score < bestScore) {
      bestScore = score;
      bestDrone = drone;
    }
  }

  if (bestDrone) {
    return bestDrone;
  }

  for (const drone of state.drones) {
    const dist = distance(player, drone);
    if (dist < bestScore && dist <= 360) {
      bestScore = dist;
      bestDrone = drone;
    }
  }

  return bestDrone;
}

function updateHeatVision(dt, isFiring) {
  const player = state.player;
  if (!isFiring || state.energy <= 0.1) {
    state.beam = null;
    return;
  }

  state.energy = Math.max(0, state.energy - 18 * dt);
  const target = findBeamTarget();

  if (!target) {
    state.beam = {
      fromX: player.x + player.facing * 18,
      fromY: player.y - 6,
      toX: player.x + player.facing * 140,
      toY: player.y - 8,
      life: 0.06
    };
    return;
  }

  target.hp -= 140 * dt;
  state.beam = {
    fromX: player.x + player.facing * 18,
    fromY: player.y - 6,
    toX: target.x,
    toY: target.y,
    life: 0.08
  };
}

function saveCivilian(civilian) {
  state.player.carryingId = null;
  state.rescues += 1;
  state.cityHealth = Math.min(100, state.cityHealth + 10);
  state.energy = Math.min(100, state.energy + 20);
  boostCombo(2);
  const gained = addScore(240);
  spawnParticles(civilian.x, civilian.y, "#8df0b4", 18, 90);
  setAnnouncer(`Rescue complete! +${gained} points`, "#8df0b4", 2.1);
}

function loseCivilian(civilian) {
  if (state.player.carryingId === civilian.id) {
    state.player.carryingId = null;
  }

  state.civiliansLost += 1;
  state.cityHealth = Math.max(0, state.cityHealth - 6);
  state.screenShake = Math.max(state.screenShake, 9);
  breakCombo();
  spawnParticles(civilian.x, GROUND_Y - 8, "#ff8b5f", 14, 95);
  setAnnouncer("A civilian was lost. Metropolis takes the hit.", "#ffb17c", 2.2);
}

function updateCivilians(dt) {
  state.spawnTimers.civilian -= dt;
  if (state.spawnTimers.civilian <= 0 && state.civilians.length < 2) {
    state.civilians.push(createCivilian());
    state.spawnTimers.civilian = randomRange(3.4, 5.2);
  }

  const next = [];

  for (const civilian of state.civilians) {
    if (civilian.status === "carried") {
      civilian.x = state.player.x + state.player.facing * 14;
      civilian.y = state.player.y + 18;

      if (rectContainsCircle(state.safeZone, civilian)) {
        saveCivilian(civilian);
        continue;
      }
    } else {
      civilian.vy += 105 * dt;
      civilian.x += civilian.vx * dt;
      civilian.y += civilian.vy * dt;

      if (
        state.player.carryingId === null &&
        distance(civilian, state.player) < civilian.radius + state.player.radius + 24
      ) {
        civilian.status = "carried";
        civilian.vx = 0;
        civilian.vy = 0;
        state.player.carryingId = civilian.id;
        boostCombo(1);
        setAnnouncer("Civilian secured. Bring them to the Daily Planet roof.", "#9dffe2");
      }

      if (civilian.y >= GROUND_Y - 8) {
        loseCivilian(civilian);
        continue;
      }
    }

    next.push(civilian);
  }

  state.civilians = next;
}

function destroyDrone(drone) {
  state.dronesCleared += 1;
  state.energy = Math.min(100, state.energy + 14);
  boostCombo(1);
  const gained = addScore(170);
  spawnParticles(drone.x, drone.y, "#ffd662", 20, 120);
  setAnnouncer(`Drone down! +${gained} points`, "#ffd662", 1.5);
}

function updateDrones(dt) {
  state.spawnTimers.drone -= dt;
  if (state.spawnTimers.drone <= 0 && state.drones.length < 4) {
    state.drones.push(createDrone());
    state.spawnTimers.drone = randomRange(3.8, 5.8);
  }

  const survivors = [];

  for (const drone of state.drones) {
    if (drone.hp <= 0) {
      destroyDrone(drone);
      continue;
    }

    const hoverX = drone.targetX + Math.cos(performance.now() / 650 + drone.drift) * 32;
    const hoverY = drone.targetY + Math.sin(performance.now() / 520 + drone.drift) * 18;
    const dx = hoverX - drone.x;
    const dy = hoverY - drone.y;

    drone.vx += clamp(dx * 0.85, -140, 140) * dt;
    drone.vy += clamp(dy * 0.9, -110, 110) * dt;
    drone.vx *= Math.pow(0.94, dt * 60);
    drone.vy *= Math.pow(0.94, dt * 60);
    drone.x += drone.vx * dt;
    drone.y += drone.vy * dt;

    if (Math.abs(dx) < 80 && Math.abs(dy) < 60) {
      drone.phase = "attack";
    }

    if (drone.phase === "attack") {
      drone.fireTimer -= dt;
      if (drone.fireTimer <= 0) {
        drone.fireTimer = randomRange(1.8, 2.8);
        state.cityHealth = Math.max(0, state.cityHealth - 3);
        state.screenShake = Math.max(state.screenShake, 7);
        breakCombo();
        spawnParticles(drone.targetX, drone.targetY + 70, "#ff7e59", 10, 80);
        setAnnouncer("Drone fire is tearing into the skyline.", "#ff9870", 1.7);
      }
    }

    survivors.push(drone);
  }

  state.drones = survivors;
}

function updateRingRoute(dt) {
  if (!state.ringRoute) {
    state.ringCooldown -= dt;
    if (state.ringCooldown <= 0) {
      state.ringRoute = createRingRoute();
      setAnnouncer("New ring route online. Hit the glowing checkpoints for shield power.");
    }
    return;
  }

  state.ringRoute.timer -= dt;
  if (state.ringRoute.timer <= 0) {
    state.ringRoute = null;
    state.ringCooldown = 2.6;
    setAnnouncer("Ring route faded out. Another path is spinning up.", "#b7c4d8", 1.5);
    return;
  }

  const currentRing = state.ringRoute.rings[state.ringRoute.index];
  if (!currentRing) {
    return;
  }

  if (distance(state.player, currentRing) <= currentRing.radius + state.player.radius) {
    boostCombo(1);
    state.energy = Math.min(100, state.energy + 12);
    const gained = addScore(60);
    spawnParticles(currentRing.x, currentRing.y, "#ffe684", 14, 80);
    state.ringRoute.index += 1;
    setAnnouncer(`Ring hit! +${gained} points`, "#ffe684", 1.1);

    if (state.ringRoute.index >= state.ringRoute.rings.length) {
      state.chainCount += 1;
      state.cityHealth = Math.min(100, state.cityHealth + 12);
      state.energy = Math.min(100, state.energy + 22);
      const routeBonus = addScore(200);
      spawnParticles(currentRing.x, currentRing.y, "#ffffff", 26, 130);
      setAnnouncer(`Route clear! City shield surges. +${routeBonus} points`, "#9dffe2", 2.2);
      state.ringRoute = null;
      state.ringCooldown = 3.4;
    }
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.pow(0.98, dt * 60);
    particle.vy *= Math.pow(0.98, dt * 60);
    return particle.life > 0;
  });
}

function updateAnnouncer(dt) {
  if (state.announcer.timer > 0 && state.phase === "playing") {
    state.announcer.timer -= dt;
  }

  if (state.comboTimer > 0 && state.phase === "playing") {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      breakCombo();
    }
  }

  if (state.screenShake > 0 && state.phase === "playing") {
    state.screenShake = Math.max(0, state.screenShake - dt * 18);
  }
}

function updateCamera(dt) {
  const targetX = clamp(state.player.x - VIEW_WIDTH * 0.38, 0, WORLD_WIDTH - VIEW_WIDTH);
  state.cameraX = lerp(state.cameraX, targetX, Math.min(1, dt * 5));
}

function updateObjectiveText() {
  if (state.player.carryingId !== null) {
    state.objectiveText = "Carry the civilian to the Daily Planet roof before the drone fire worsens.";
    return;
  }

  if (state.cityHealth <= 25) {
    state.objectiveText = "The city is close to collapse. Prioritize drones and use ring routes to recharge the shield.";
    return;
  }

  if (state.ringRoute) {
    state.objectiveText = "The highlighted ring route is active. Fly it clean for shield power and combo score.";
    return;
  }

  state.objectiveText = "Scan for falling civilians and chew through drones while the next ring route powers up.";
}

function updateMissionState() {
  if (state.cityHealth <= 0) {
    state.phase = "lost";
    state.statusText = "Mission Failed";
    setAnnouncer("Metropolis fell before the mission was stabilized.", "#ff8b5f", 99);
    return;
  }

  if (state.rescues >= RESCUE_GOAL && state.dronesCleared >= DRONE_GOAL) {
    state.phase = "won";
    state.statusText = "Mission Complete";
    setAnnouncer("Metropolis is safe. Cartridge redeemed.", "#9dffe2", 99);
    return;
  }

  if (state.timeRemaining <= 0) {
    state.phase = "lost";
    state.statusText = "Time Up";
    setAnnouncer("The mission clock ran out before the city was stabilized.", "#ffb17c", 99);
  }
}

function updateGame(dt) {
  state.timeRemaining -= dt;
  updatePlayer(dt);
  updateCivilians(dt);
  updateDrones(dt);
  updateRingRoute(dt);
  updateParticles(dt);
  updateAnnouncer(dt);
  updateCamera(dt);
  updateObjectiveText();
  updateMissionState();
}
function drawBackground(cameraX) {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, "#0b2952");
  gradient.addColorStop(0.55, "#1370bd");
  gradient.addColorStop(1, "#f29b4b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  ctx.save();
  ctx.translate(-cameraX * 0.2, 0);
  ctx.fillStyle = "rgba(255, 224, 138, 0.9)";
  ctx.beginPath();
  ctx.arc(2800, 110, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (const cloud of state.clouds) {
    const x = ((cloud.x - cameraX * 0.24) % (WORLD_WIDTH + 400)) - 200;
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, cloud.y, cloud.size, cloud.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      x + cloud.size * 0.4,
      cloud.y + 4,
      cloud.size * 0.72,
      cloud.size * 0.36,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255, 187, 82, 0.18)";
  ctx.fillRect(0, VIEW_HEIGHT - 100, VIEW_WIDTH, 100);
}

function drawCity(cameraX) {
  ctx.fillStyle = "#16253c";
  ctx.fillRect(0, GROUND_Y - 10, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y + 10);

  for (const building of state.buildings) {
    const screenX = building.x - cameraX;
    if (screenX + building.width < -40 || screenX > VIEW_WIDTH + 40) {
      continue;
    }

    ctx.fillStyle = building.color;
    ctx.fillRect(screenX, building.top, building.width, building.height);

    const windowRows = Math.floor(building.height / 22);
    const windowCols = Math.floor(building.width / 18);
    for (let row = 0; row < windowRows; row += 1) {
      for (let col = 0; col < windowCols; col += 1) {
        if ((row + col) % 3 === 0) {
          continue;
        }

        ctx.fillStyle = row % 2 === 0 ? "rgba(255, 219, 124, 0.7)" : "rgba(122, 210, 255, 0.35)";
        ctx.fillRect(screenX + 10 + col * 18, building.top + 12 + row * 22, 8, 12);
      }
    }

    if (building.x >= 180 && building.x <= 360) {
      ctx.fillStyle = "#e8edf3";
      ctx.fillRect(screenX + 72, building.top - 24, 30, 24);
      ctx.beginPath();
      ctx.arc(screenX + 87, building.top - 30, 20, 0, Math.PI * 2);
      ctx.strokeStyle = "#f2a93b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#ff5a4a";
      ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
      ctx.fillText("DP", screenX + 76, building.top - 24);
    }
  }

  const safeX = state.safeZone.x - cameraX;
  ctx.fillStyle = "rgba(157, 255, 226, 0.24)";
  ctx.fillRect(safeX, state.safeZone.y, state.safeZone.width, state.safeZone.height);
  ctx.strokeStyle = "#9dffe2";
  ctx.lineWidth = 3;
  ctx.strokeRect(safeX, state.safeZone.y, state.safeZone.width, state.safeZone.height);
  ctx.fillStyle = "#dffef2";
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText("SAFE ROOF", safeX + 14, state.safeZone.y + 20);
}

function drawRingRoute(cameraX) {
  if (!state.ringRoute) {
    return;
  }

  state.ringRoute.rings.forEach((ring, index) => {
    const screenX = ring.x - cameraX;
    if (screenX < -60 || screenX > VIEW_WIDTH + 60) {
      return;
    }

    const active = index === state.ringRoute.index;
    ctx.save();
    ctx.translate(screenX, ring.y);
    ctx.rotate(performance.now() / 350);
    ctx.strokeStyle = active ? "#fff4af" : "rgba(255, 214, 98, 0.55)";
    ctx.lineWidth = active ? 7 : 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.radius, ring.radius * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (active) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(screenX, ring.y, ring.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

function drawCivilian(civilian, cameraX) {
  const x = civilian.x - cameraX;
  ctx.fillStyle = "#e7f2ff";
  ctx.beginPath();
  ctx.arc(x, civilian.y - 10, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d7de3";
  ctx.fillRect(x - 6, civilian.y - 4, 12, 18);
  ctx.strokeStyle = "#dbeafe";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, civilian.y + 6);
  ctx.lineTo(x + 10, civilian.y + 6);
  ctx.stroke();
}

function drawDrone(drone, cameraX) {
  const x = drone.x - cameraX;
  ctx.save();
  ctx.translate(x, drone.y);
  ctx.fillStyle = "#ff5959";
  ctx.fillRect(-12, -8, 24, 16);
  ctx.fillStyle = "#22252a";
  ctx.fillRect(-7, -4, 14, 8);
  ctx.strokeStyle = "#ffcf73";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-6, 0);
  ctx.moveTo(6, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fillRect(x - 18, drone.y - 24, 36, 4);
  ctx.fillStyle = "#ffd662";
  ctx.fillRect(x - 18, drone.y - 24, 36 * clamp(drone.hp / 90, 0, 1), 4);
}

function drawPlayer(cameraX) {
  const player = state.player;
  const x = player.x - cameraX;

  ctx.save();
  ctx.translate(x, player.y);
  ctx.scale(player.facing, 1);

  ctx.fillStyle = "#d62d2d";
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-28, 10);
  ctx.lineTo(-12, 24);
  ctx.lineTo(-2, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2e74ff";
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(10, -8);
  ctx.lineTo(14, 12);
  ctx.lineTo(0, 18);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f8d9b6";
  ctx.beginPath();
  ctx.arc(10, -12, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffd662";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(6, 6);
  ctx.lineTo(-2, 12);
  ctx.stroke();

  ctx.restore();
}

function drawBeam(cameraX) {
  if (!state.beam) {
    return;
  }

  ctx.strokeStyle = "rgba(255, 105, 105, 0.95)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(state.beam.fromX - cameraX, state.beam.fromY);
  ctx.lineTo(state.beam.toX - cameraX, state.beam.toY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 227, 144, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(state.beam.fromX - cameraX, state.beam.fromY + 2);
  ctx.lineTo(state.beam.toX - cameraX, state.beam.toY + 2);
  ctx.stroke();
}

function drawParticles(cameraX) {
  for (const particle of state.particles) {
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - cameraX, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawIndicators(cameraX) {
  const targets = [];
  const carried = state.player.carryingId !== null;
  const currentRing = state.ringRoute ? state.ringRoute.rings[state.ringRoute.index] : null;
  const nearestCivilian = carried
    ? null
    : state.civilians.reduce((best, civilian) => {
        if (civilian.status !== "falling") {
          return best;
        }
        if (!best || distance(state.player, civilian) < distance(state.player, best)) {
          return civilian;
        }
        return best;
      }, null);

  const nearestDrone = state.drones.reduce((best, drone) => {
    if (!best || distance(state.player, drone) < distance(state.player, best)) {
      return drone;
    }
    return best;
  }, null);

  if (carried) {
    targets.push({
      ...state.safeZone,
      x: state.safeZone.x + state.safeZone.width / 2,
      y: state.safeZone.y + 12,
      label: "DROP",
      color: "#9dffe2"
    });
  } else if (nearestCivilian) {
    targets.push({ ...nearestCivilian, label: "SAVE", color: "#9dffe2" });
  }

  if (currentRing) {
    targets.push({ ...currentRing, label: "RING", color: "#ffd662" });
  }

  if (nearestDrone) {
    targets.push({ ...nearestDrone, label: "DRONE", color: "#ff8b5f" });
  }

  for (const target of targets) {
    const screenX = target.x - cameraX;
    if (screenX >= 24 && screenX <= VIEW_WIDTH - 24) {
      continue;
    }

    const edgeX = clamp(screenX, 24, VIEW_WIDTH - 24);
    const edgeY = clamp(target.y, 30, VIEW_HEIGHT - 30);
    const direction = screenX < 0 ? -1 : 1;

    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.moveTo(edgeX, edgeY);
    ctx.lineTo(edgeX - direction * 18, edgeY - 10);
    ctx.lineTo(edgeX - direction * 18, edgeY + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#f8f5ea";
    ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
    ctx.fillText(target.label, edgeX - 16, edgeY - 14);
  }
}

function drawMissionOverlay() {
  if (state.phase === "playing") {
    return;
  }

  ctx.fillStyle = "rgba(5, 12, 24, 0.62)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  let title = "Superman 64 2D";
  let copy = "Start the mission, fly the route, and prove the cartridge can be rescued too.";

  if (state.phase === "paused") {
    title = "Paused";
    copy = "The city is holding. Jump back in when you are ready.";
  } else if (state.phase === "won") {
    title = "Mission Complete";
    copy = `Metropolis is safe with ${state.rescues} rescues and ${state.dronesCleared} drones cleared.`;
  } else if (state.phase === "lost") {
    title = "Mission Failed";
    copy = `Score ${state.score}. Rescue more civilians or stop more drones before the city gives out.`;
  }

  ctx.fillStyle = "#f8f5ea";
  ctx.textAlign = "center";
  ctx.font = 'bold 40px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
  ctx.fillText(title, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 22);
  ctx.font = '20px "Trebuchet MS", sans-serif';
  ctx.fillText(copy, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 18);
  ctx.textAlign = "start";
}
function drawHudInCanvas() {
  ctx.fillStyle = "rgba(6, 16, 30, 0.58)";
  ctx.fillRect(16, 14, 250, 86);
  ctx.fillStyle = "#f8f5ea";
  ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
  ctx.fillText(`Time ${formatTime(state.timeRemaining)}`, 28, 40);
  ctx.fillText(`Shield ${Math.round(state.cityHealth)}%`, 28, 64);
  ctx.fillText(`Energy ${Math.round(state.energy)}%`, 28, 88);

  ctx.fillStyle = "rgba(6, 16, 30, 0.58)";
  ctx.fillRect(VIEW_WIDTH - 254, 14, 238, 86);
  ctx.fillStyle = "#f8f5ea";
  ctx.textAlign = "right";
  ctx.fillText(`Rescues ${state.rescues}/${RESCUE_GOAL}`, VIEW_WIDTH - 28, 40);
  ctx.fillText(`Drones ${state.dronesCleared}/${DRONE_GOAL}`, VIEW_WIDTH - 28, 64);
  ctx.fillText(`Routes ${state.chainCount}`, VIEW_WIDTH - 28, 88);
  ctx.textAlign = "start";
}

function render() {
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const shakeX = state.screenShake > 0 ? randomRange(-state.screenShake, state.screenShake) : 0;
  const shakeY = state.screenShake > 0 ? randomRange(-state.screenShake, state.screenShake) : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground(state.cameraX);
  drawCity(state.cameraX);
  drawRingRoute(state.cameraX);
  state.civilians.forEach((civilian) => drawCivilian(civilian, state.cameraX));
  state.drones.forEach((drone) => drawDrone(drone, state.cameraX));
  drawBeam(state.cameraX);
  drawPlayer(state.cameraX);
  drawParticles(state.cameraX);
  drawIndicators(state.cameraX);
  drawHudInCanvas();
  drawMissionOverlay();
  ctx.restore();
}

function syncHud() {
  cityHealthValue.textContent = `${Math.round(state.cityHealth)}%`;
  cityHealthFill.style.transform = `scaleX(${clamp(state.cityHealth / 100, 0, 1)})`;
  energyValue.textContent = `${Math.round(state.energy)}%`;
  energyFill.style.transform = `scaleX(${clamp(state.energy / 100, 0, 1)})`;
  scoreValue.textContent = String(state.score);
  comboValue.textContent = `Combo x${(1 + Math.min(2, state.combo * 0.1)).toFixed(1)}`;
  rescuesValue.textContent = String(state.rescues);
  dronesValue.textContent = String(state.dronesCleared);
  announcerEl.textContent = state.announcer.text;
  announcerEl.style.color = state.announcer.color;
  statusValue.textContent = `Status: ${state.statusText}`;
  objectiveValue.textContent = state.objectiveText;
  pauseBtn.textContent = state.phase === "paused" ? "Resume" : "Pause";
  startBtn.disabled = state.phase === "playing";
  pauseBtn.disabled = !(state.phase === "playing" || state.phase === "paused");
}

function tick(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTimestamp) / 1000 || 0.016);
  lastTimestamp = timestamp;

  if (state.phase === "playing") {
    updateGame(dt);
  } else {
    updateParticles(dt);
    updateAnnouncer(dt);
    updateCamera(dt);
  }

  if (state.beam) {
    state.beam.life -= dt;
    if (state.beam.life <= 0) {
      state.beam = null;
    }
  }

  syncHud();
  render();
  requestAnimationFrame(tick);
}

function handleKeyChange(event, isActive) {
  const mapped = keyMap[event.key];
  if (mapped) {
    keysDown[mapped] = isActive;
    event.preventDefault();
  }

  if (!isActive && (event.key === "p" || event.key === "P")) {
    togglePause();
  }

  if (!isActive && event.key === "Enter") {
    if (state.phase === "intro" || state.phase === "won" || state.phase === "lost") {
      startMission();
    }
  }
}

window.addEventListener("keydown", (event) => handleKeyChange(event, true));
window.addEventListener("keyup", (event) => handleKeyChange(event, false));

touchButtons.forEach((button) => {
  const inputName = button.dataset.input;
  if (!inputName) {
    return;
  }

  const activate = (event) => {
    event.preventDefault();
    keysDown[inputName] = true;
    button.classList.add("active");
  };

  const deactivate = (event) => {
    event.preventDefault();
    keysDown[inputName] = false;
    button.classList.remove("active");
  };

  button.addEventListener("pointerdown", activate);
  button.addEventListener("pointerup", deactivate);
  button.addEventListener("pointerleave", deactivate);
  button.addEventListener("pointercancel", deactivate);
});

startBtn.addEventListener("click", startMission);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => resetGame(true));

syncHud();
requestAnimationFrame(tick);


