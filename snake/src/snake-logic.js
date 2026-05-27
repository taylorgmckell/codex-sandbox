export const GRID_SIZE = 20;

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function getInitialState(gridSize = GRID_SIZE) {
  const center = Math.floor(gridSize / 2);
  return {
    gridSize,
    snake: [{ x: center, y: center }],
    direction: "right",
    pendingDirection: "right",
    food: { x: center + 3, y: center },
    score: 0,
    isGameOver: false,
    isPaused: false
  };
}

function isOppositeDirection(current, next) {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}

export function setDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) return state;
  const baseDirection = state.pendingDirection ?? state.direction;
  if (isOppositeDirection(baseDirection, nextDirection) && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection
  };
}

export function randomFoodPosition(gridSize, snake, random = Math.random) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) freeCells.push({ x, y });
    }
  }

  if (freeCells.length === 0) return null;

  const index = Math.floor(random() * freeCells.length);
  return freeCells[index];
}

export function togglePause(state) {
  if (state.isGameOver) return state;
  return { ...state, isPaused: !state.isPaused };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver || state.isPaused) return state;

  const direction = state.pendingDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize;

  if (outOfBounds) {
    return { ...state, direction, isGameOver: true };
  }

  const grows = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextSnake = [nextHead, ...state.snake];

  if (!grows) {
    nextSnake.pop();
  }

  const selfCollision = nextSnake
    .slice(1)
    .some((part) => part.x === nextHead.x && part.y === nextHead.y);

  if (selfCollision) {
    return { ...state, direction, isGameOver: true };
  }

  if (!grows) {
    return {
      ...state,
      direction,
      snake: nextSnake
    };
  }

  const food = randomFoodPosition(state.gridSize, nextSnake, random);

  return {
    ...state,
    direction,
    snake: nextSnake,
    food: food ?? state.food,
    score: state.score + 1
  };
}
