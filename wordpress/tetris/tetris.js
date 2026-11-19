const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const boardCanvas = document.getElementById('board');
const ctx = boardCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdCtx = holdCanvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');

const COLORS = {
  I: '#00e5ff',
  J: '#4d7cff',
  L: '#ff9f1c',
  O: '#ffe600',
  S: '#2ee66b',
  T: '#c44dff',
  Z: '#ff4d6d',
};

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
};

let grid;
let current;
let holdType = null;
let canHold = true;
let bag = [];
let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;
let paused = false;
let dropCounter = 0;
let lastTime = 0;
let softDrop = false;

function newGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function refillBag() {
  bag = Object.keys(SHAPES);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function nextType() {
  if (bag.length === 0) refillBag();
  return bag.pop();
}

function peekNext() {
  if (bag.length === 0) refillBag();
  return bag[bag.length - 1];
}

function makePiece(type) {
  const matrix = SHAPES[type].map(row => row.slice());
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: type === 'I' ? -1 : 0,
  };
}

function collides(matrix, px, py) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (!matrix[y][x]) continue;
      const bx = px + x;
      const by = py + y;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && grid[by][bx]) return true;
    }
  }
  return false;
}

function merge() {
  current.matrix.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v && current.y + y >= 0) grid[current.y + y][current.x + x] = current.type;
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(null));
      cleared++;
      y++;
    }
  }
  if (cleared > 0) {
    score += [0, 100, 300, 500, 800][cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    updateHud();
  }
}

function rotateMatrix(matrix, dir) {
  const n = matrix.length;
  const res = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (dir > 0) res[x][n - 1 - y] = matrix[y][x];
      else res[n - 1 - x][y] = matrix[y][x];
    }
  }
  return res;
}

function tryRotate(dir) {
  if (gameOver || paused) return;
  const rotated = rotateMatrix(current.matrix, dir);
  for (const dx of [0, -1, 1, -2, 2]) {
    for (const dy of [0, -1]) {
      if (!collides(rotated, current.x + dx, current.y + dy)) {
        current.matrix = rotated;
        current.x += dx;
        current.y += dy;
        return;
      }
    }
  }
}

function move(dx) {
  if (gameOver || paused) return;
  if (!collides(current.matrix, current.x + dx, current.y)) current.x += dx;
}

function drop() {
  if (!collides(current.matrix, current.x, current.y + 1)) {
    current.y++;
    if (softDrop) {
      score += 1;
      updateHud();
    }
  } else {
    lockPiece();
  }
  dropCounter = 0;
}

function hardDrop() {
  if (gameOver || paused) return;
  let dist = 0;
  while (!collides(current.matrix, current.x, current.y + 1)) {
    current.y++;
    dist++;
  }
  score += dist * 2;
  updateHud();
  lockPiece();
  dropCounter = 0;
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
  canHold = true;
}

function spawn() {
  current = makePiece(nextType());
  if (collides(current.matrix, current.x, current.y)) endGame();
}

function endGame() {
  gameOver = true;
  showOverlay('PARTIE TERMIN\u00c9E', 'Appuie sur Entr\u00e9e pour rejouer');
}

function hold() {
  if (gameOver || paused || !canHold) return;
  const t = current.type;
  if (holdType) {
    current = makePiece(holdType);
    if (collides(current.matrix, current.x, current.y)) {
      endGame();
      drawHold();
      return;
    }
  } else {
    spawn();
  }
  holdType = t;
  canHold = false;
  drawHold();
}

function getInterval() {
  return Math.max(70, 900 * Math.pow(0.82, level - 1));
}

function updateHud() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function showOverlay(title, sub) {
  overlayTitle.textContent = title;
  overlaySub.textContent = sub;
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.classList.remove('show');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (paused) showOverlay('PAUSE', 'Appuie sur P pour reprendre');
  else hideOverlay();
}

function restart() {
  grid = newGrid();
  score = 0;
  lines = 0;
  level = 1;
  gameOver = false;
  paused = false;
  holdType = null;
  canHold = true;
  bag = [];
  dropCounter = 0;
  refillBag();
  spawn();
  updateHud();
  hideOverlay();
  drawHold();
}

function drawBlock(context, x, y, size, color, alpha) {
  context.globalAlpha = alpha === undefined ? 1 : alpha;
  context.fillStyle = color;
  context.fillRect(x * size, y * size, size, size);
  context.fillStyle = 'rgba(255,255,255,0.28)';
  context.fillRect(x * size, y * size, size, size / 5);
  context.fillStyle = 'rgba(0,0,0,0.28)';
  context.fillRect(x * size, (y + 1) * size - size / 5, size, size / 5);
  context.strokeStyle = 'rgba(0,0,0,0.45)';
  context.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
  context.globalAlpha = 1;
}

function draw() {
  ctx.fillStyle = '#05050c';
  ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let x = 1; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK, 0);
    ctx.lineTo(x * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK);
    ctx.lineTo(COLS * BLOCK, y * BLOCK);
    ctx.stroke();
  }
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) drawBlock(ctx, x, y, BLOCK, COLORS[cell]);
    });
  });
  if (current && !gameOver) {
    let ghostY = current.y;
    while (!collides(current.matrix, current.x, ghostY + 1)) ghostY++;
    current.matrix.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v && ghostY + y >= 0) drawBlock(ctx, current.x + x, ghostY + y, BLOCK, COLORS[current.type], 0.18);
      });
    });
    current.matrix.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v && current.y + y >= 0) drawBlock(ctx, current.x + x, current.y + y, BLOCK, COLORS[current.type]);
      });
    });
  }
}

function drawPreview(context, type, alpha) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!type) return;
  const matrix = SHAPES[type];
  const size = 20;
  const w = matrix[0].length;
  const h = matrix.length;
  const ox = (context.canvas.width / size - w) / 2;
  const oy = (context.canvas.height / size - h) / 2;
  matrix.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v) drawBlock(context, x + ox, y + oy, size, COLORS[type], alpha);
    });
  });
}

function drawNext() {
  drawPreview(nextCtx, peekNext(), 1);
}

function drawHold() {
  drawPreview(holdCtx, holdType, canHold ? 1 : 0.35);
}

function update(time) {
  if (time === undefined) time = 0;
  const delta = time - lastTime;
  lastTime = time;
  if (!paused && !gameOver) {
    dropCounter += delta;
    const interval = softDrop ? 45 : getInterval();
    if (dropCounter >= interval) drop();
  }
  draw();
  drawNext();
  requestAnimationFrame(update);
}

let dasDir = 0;
let dasTimeout = null;
let arrInterval = null;

function startDas(dir) {
  move(dir);
  dasDir = dir;
  clearTimeout(dasTimeout);
  clearInterval(arrInterval);
  dasTimeout = setTimeout(() => {
    arrInterval = setInterval(() => move(dasDir), 45);
  }, 160);
}

function stopDas(dir) {
  if (dasDir === dir) {
    dasDir = 0;
    clearTimeout(dasTimeout);
    clearInterval(arrInterval);
  }
}

document.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.key)) e.preventDefault();
  if (e.repeat) return;
  if (gameOver) {
    if (e.key === 'Enter') restart();
    return;
  }
  switch (e.key) {
    case 'ArrowLeft': startDas(-1); break;
    case 'ArrowRight': startDas(1); break;
    case 'ArrowDown': softDrop = true; break;
    case 'ArrowUp':
    case 'x':
    case 'X': tryRotate(1); break;
    case 'z':
    case 'Z': tryRotate(-1); break;
    case ' ': hardDrop(); break;
    case 'c':
    case 'C': hold(); break;
    case 'p':
    case 'P': togglePause(); break;
    case 'Enter': restart(); break;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') stopDas(-1);
  if (e.key === 'ArrowRight') stopDas(1);
  if (e.key === 'ArrowDown') softDrop = false;
});

document.querySelectorAll('.touch button').forEach((btn) => {
  const key = btn.dataset.key;
  const press = (e) => {
    if (e) e.preventDefault();
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };
  const release = (e) => {
    if (e) e.preventDefault();
    document.dispatchEvent(new KeyboardEvent('keyup', { key }));
  };
  btn.addEventListener('touchstart', press, { passive: false });
  btn.addEventListener('touchend', release, { passive: false });
  btn.addEventListener('touchcancel', release, { passive: false });
  btn.addEventListener('mousedown', press);
  btn.addEventListener('mouseup', release);
  btn.addEventListener('mouseleave', release);
});

grid = newGrid();
refillBag();
spawn();
updateHud();
drawHold();
requestAnimationFrame(update);
