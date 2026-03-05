import {
  GRID_SIZE,
  getInitialState,
  setDirection,
  stepGame,
  togglePause
} from "./snake-logic.js";

const TICK_MS = 140;
const CELL_SIZE = 20;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const touchButtons = document.querySelectorAll("[data-dir]");

canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

let state = getInitialState(GRID_SIZE);

function renderGrid() {
  ctx.strokeStyle = "#e8ebdf";
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const p = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawCell(point, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    point.x * CELL_SIZE + 1,
    point.y * CELL_SIZE + 1,
    CELL_SIZE - 2,
    CELL_SIZE - 2
  );
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderGrid();
  drawCell(state.food, "#c0392b");
  state.snake.forEach((part, index) => {
    drawCell(part, index === 0 ? "#246628" : "#2f7d32");
  });

  scoreEl.textContent = String(state.score);

  if (state.isGameOver) {
    statusEl.textContent = "Game Over";
    pauseBtn.disabled = true;
  } else if (state.isPaused) {
    statusEl.textContent = "Paused";
    pauseBtn.disabled = false;
  } else {
    statusEl.textContent = "Running";
    pauseBtn.disabled = false;
  }

  pauseBtn.textContent = state.isPaused ? "Resume" : "Pause";
}

function nextTick() {
  state = stepGame(state);
  render();
}

function handleDirectionInput(direction) {
  if (state.isGameOver) return;
  state = setDirection(state, direction);
}

function resetGame() {
  state = getInitialState(GRID_SIZE);
  render();
}

const keyToDirection = {
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
  D: "right"
};

window.addEventListener("keydown", (event) => {
  if (event.key === "p" || event.key === "P") {
    state = togglePause(state);
    render();
    return;
  }

  const direction = keyToDirection[event.key];
  if (!direction) return;

  event.preventDefault();
  handleDirectionInput(direction);
});

restartBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

touchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.dir;
    if (!direction) return;
    handleDirectionInput(direction);
  });
});

setInterval(nextTick, TICK_MS);
render();
