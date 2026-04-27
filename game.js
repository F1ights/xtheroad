const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const TILE = 40;
const COLS = 10;

// ---------------- STATE ----------------
let started = false;
let gameOver = false;

let player, cameraY, score;
let world = {};
let vehicles = [];
let checkpoint = { x: 5, y: 0 };

// ---------------- CONFIG ----------------
const SAFE_START = 4;
const CHECKPOINT_STEP = 10;

// ---------------- START ----------------
window.startGame = function () {
  document.getElementById("startScreen").classList.add("hidden");
  resetToCheckpoint();
  started = true;
};

// ---------------- RESET ----------------
function resetToCheckpoint() {
  player = { x: checkpoint.x, y: checkpoint.y };
  cameraY = player.y * TILE - 250;
  score = player.y;

  gameOver = false;
  world = {};
  vehicles = [];

  updateScore();
  document.getElementById("gameOverScreen").classList.add("hidden");
}

// ---------------- RESTART ----------------
window.restartCheckpoint = function () {
  resetToCheckpoint();
};

// ---------------- INPUT ----------------
window.addEventListener("keydown", e => {
  if (!started || gameOver) return;

  if (e.key === "ArrowUp") move(0, 1);
  if (e.key === "ArrowDown") move(0, -1);
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
});

window.move = function (dx, dy) {
  if (!started || gameOver) return;

  player.x += dx;
  player.y += dy;

  player.x = Math.max(0, Math.min(COLS - 1, player.x));
  player.y = Math.max(0, player.y);

  score = Math.max(score, player.y);
  updateScore();

  // checkpoint save
  if (player.y % CHECKPOINT_STEP === 0 && player.y > 0) {
    checkpoint = { x: player.x, y: player.y };
  }
};

function updateScore() {
  document.getElementById("score").innerText = score;
}

// ---------------- LANE ----------------
function lane(y) {
  if (!world[y]) {

    if (y < SAFE_START) {
      world[y] = { type: "grass", safe: true, checkpoint: false };
      return world[y];
    }

    if (y % CHECKPOINT_STEP === 0) {
      world[y] = { type: "grass", safe: true, checkpoint: true };
      return world[y];
    }

    const road = Math.random() < 0.6;

    world[y] = {
      type: road ? "road" : "grass",
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.02 + Math.random() * 0.04,
      spawn: Math.random(),
      checkpoint: false
    };

    if (road && world[y].spawn > 0.35) {
      for (let i = 0; i < 2; i++) {
        vehicles.push({
          x: Math.random() * COLS,
          y,
          dir: world[y].dir,
          speed: world[y].speed,
          type: Math.random() < 0.3 ? "truck" : "car"
        });
      }
    }
  }
  return world[y];
}

// ---------------- UPDATE ----------------
function update() {
  if (!started || gameOver) return;

  cameraY = player.y * TILE - 250;

  for (let v of vehicles) {
    v.x += v.dir * v.speed;

    if (v.x < -2) v.x = COLS + 2;
    if (v.x > COLS + 2) v.x = -2;

    if (Math.floor(v.x) === player.x && v.y === player.y) {
      gameOver = true;

      document.getElementById("gameOverScreen").classList.remove("hidden");
      document.getElementById("finalScore").innerText = "Score: " + score;
    }
  }
}

// ---------------- DRAW ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const start = Math.floor(cameraY / TILE);
  const end = start + 20;

  for (let y = start; y < end; y++) {
    const l = lane(y);
    const sy = y * TILE - cameraY;

    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = l.type === "road" ? "#555" : "#3cb371";
      ctx.fillRect(x * TILE, sy, TILE, TILE);

      if (l.type === "road") {
        ctx.fillStyle = "#777";
        ctx.fillRect(x * TILE, sy + TILE / 2 - 2, TILE, 4);
      }
    }

    if (l.checkpoint) {
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(0, sy, canvas.width, TILE);
    }
  }

  // player
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(
    player.x * TILE + TILE / 2,
    player.y * TILE - cameraY + TILE / 2,
    TILE / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // vehicles
  for (let v of vehicles) {
    const x = v.x * TILE;
    const y = v.y * TILE - cameraY;

    const truck = v.type === "truck";
    const w = truck ? TILE * 1.6 : TILE * 0.9;
    const h = TILE * 0.6;
    const ox = truck ? -TILE * 0.3 : 0;

    ctx.fillStyle = truck ? "#c0392b" : "#e74c3c";
    ctx.fillRect(x + ox, y + TILE * 0.2, w, h);
  }

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("CRASH!", 140, 300);
  }
}

// ---------------- LOOP ----------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
