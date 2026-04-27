const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const tileSize = 40;
const cols = 10;

// --------------------
// GAME STATE
// --------------------
let gameStarted = false;
let gameOver = false;

let player, cameraY, score;

let world = {};
let vehicles = [];

let lastCheckpoint = { x: 5, y: 0 };

// --------------------
// CONFIG
// --------------------
const SAFE_START = 4;
const CHECKPOINT_EVERY = 10;

// --------------------
// START GAME
// --------------------
window.startGame = function () {
  document.getElementById("startScreen").style.display = "none";

  resetToCheckpoint();
  gameStarted = true;
};

// --------------------
// RESET (checkpoint respawn)
// --------------------
function resetToCheckpoint() {
  player = { x: lastCheckpoint.x, y: lastCheckpoint.y };
  cameraY = player.y * tileSize - 250;
  score = player.y;

  gameOver = false;
  world = {};
  vehicles = [];

  document.getElementById("gameOverScreen").classList.add("hidden");
}

// --------------------
// FULL RESTART FROM CHECKPOINT BUTTON
// --------------------
window.restartFromCheckpoint = function () {
  resetToCheckpoint();
};

// --------------------
// INPUT
// --------------------
window.addEventListener("keydown", e => {
  if (!gameStarted || gameOver) return;

  if (e.key === "ArrowUp") move(0, 1);
  if (e.key === "ArrowDown") move(0, -1);
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
});

window.move = function (dx, dy) {
  if (gameOver) return;

  player.x += dx;
  player.y += dy;

  player.x = Math.max(0, Math.min(cols - 1, player.x));
  player.y = Math.max(0, player.y);

  // score = highest y reached
  score = Math.max(score, player.y);

  // checkpoint save
  if (player.y % CHECKPOINT_EVERY === 0 && player.y > 0) {
    lastCheckpoint = { x: player.x, y: player.y };
  }
};

// --------------------
// LANE GENERATION
// --------------------
function getLane(y) {
  if (!world[y]) {

    // SAFE START (NO OBSTACLES)
    if (y < SAFE_START) {
      world[y] = {
        type: "grass",
        safe: true,
        checkpoint: false
      };
      return world[y];
    }

    // CHECKPOINT LANE
    if (y % CHECKPOINT_EVERY === 0) {
      world[y] = {
        type: "grass",
        safe: true,
        checkpoint: true
      };
      return world[y];
    }

    // NORMAL LANE
    const isRoad = Math.random() < 0.6;

    world[y] = {
      type: isRoad ? "road" : "grass",
      safe: !isRoad,
      checkpoint: false,

      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.02 + Math.random() * 0.04,
      spawnRate: Math.random()
    };

    // spawn vehicles ONLY on road AND NOT safe start
    if (isRoad && y >= SAFE_START && world[y].spawnRate > 0.35) {
      const count = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < count; i++) {
        vehicles.push({
          x: Math.random() * cols,
          y: y,
          dir: world[y].dir,
          speed: world[y].speed,
          type: Math.random() < 0.25 ? "truck" : "car"
        });
      }
    }

    return world[y];
  }

  return world[y];
}

// --------------------
// UPDATE
// --------------------
function update() {
  if (!gameStarted || gameOver) return;

  // FIXED CAMERA (NOT INVERTED)
  cameraY = player.y * tileSize - 250;

  for (let v of vehicles) {
    v.x += v.dir * v.speed;

    if (v.x < -2) v.x = cols + 2;
    if (v.x > cols + 2) v.x = -2;

    // collision
    if (Math.floor(v.x) === player.x && v.y === player.y) {
      gameOver = true;

      document.getElementById("gameOverScreen").classList.remove("hidden");
      document.getElementById("finalScore").innerText =
        "Score: " + score;
    }
  }
}

// --------------------
// DRAW LANE
// --------------------
function drawLane(y, lane) {
  const sy = y * tileSize - cameraY;

  for (let x = 0; x < cols; x++) {

    if (lane.checkpoint) {
      ctx.fillStyle = "#2ecc71";
    } else {
      ctx.fillStyle = lane.type === "road" ? "#555" : "#3cb371";
    }

    ctx.fillRect(x * tileSize, sy, tileSize, tileSize);

    if (lane.type === "road") {
      ctx.fillStyle = "#777";
      ctx.fillRect(x * tileSize, sy + tileSize / 2 - 2, tileSize, 4);
    }
  }

  if (lane.checkpoint) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, sy, canvas.width, tileSize);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("CHECKPOINT", 120, sy + 25);
  }
}

// --------------------
// DRAW VEHICLE
// --------------------
function drawVehicle(v) {
  const x = v.x * tileSize;
  const y = v.y * tileSize - cameraY;

  const truck = v.type === "truck";

  const w = truck ? tileSize * 1.6 : tileSize * 0.9;
  const h = tileSize * 0.7;

  const ox = truck ? -tileSize * 0.3 : 0;

  ctx.fillStyle = truck ? "#c0392b" : "#e74c3c";
  ctx.fillRect(x + ox, y + tileSize * 0.2, w, h);

  ctx.fillStyle = "#1c1c1c";

  if (v.dir > 0) {
    ctx.fillRect(x + ox + w * 0.7, y + tileSize * 0.28, w * 0.2, h * 0.4);
  } else {
    ctx.fillRect(x + ox + w * 0.1, y + tileSize * 0.28, w * 0.2, h * 0.4);
  }
}

// --------------------
// DRAW
// --------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const start = Math.floor(cameraY / tileSize);
  const end = start + 20;

  for (let y = start; y < end; y++) {
    const lane = getLane(y);
    drawLane(y, lane);
  }

  // player
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(
    player.x * tileSize + tileSize / 2,
    player.y * tileSize - cameraY + tileSize / 2,
    tileSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  for (let v of vehicles) drawVehicle(v);

  if (!gameStarted) return;

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("CRASH!", 140, 300);
  }
}

// --------------------
// LOOP
// --------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
