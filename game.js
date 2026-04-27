const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const tileSize = 40;
const cols = 10;

// --------------------
// GAME STATE
// --------------------
let cameraY = 0;
let score = 0;
let gameOver = false;

let player = { x: 5, y: 0 };

let world = {};
let vehicles = [];

// --------------------
// CONFIG
// --------------------
const SAFE_START = 3;
const CHECKPOINT_EVERY = 10;

// --------------------
// INPUT
// --------------------
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
});

window.move = function(dir) {
  if (gameOver) return;

  if (dir === "up") player.y++;
  if (dir === "down") player.y--;
  if (dir === "left") player.x--;
  if (dir === "right") player.x++;

  player.x = Math.max(0, Math.min(cols - 1, player.x));
  player.y = Math.max(0, player.y);

  score = Math.max(score, player.y);
  document.getElementById("score").innerText = "Score: " + score;
};

// --------------------
// RESTART
// --------------------
window.restartGame = function () {
  player = { x: 5, y: 0 };
  cameraY = 0;
  score = 0;
  gameOver = false;
  world = {};
  vehicles = [];

  document.getElementById("gameOverScreen").classList.add("hidden");
};

// --------------------
// LANE GENERATION
// --------------------
function getLane(y) {
  if (!world[y]) {

    // SAFE START ZONE
    if (y < SAFE_START) {
      world[y] = {
        type: "grass",
        safe: true,
        checkpoint: false
      };
    }

    // CHECKPOINT
    else if (y % CHECKPOINT_EVERY === 0) {
      world[y] = {
        type: "grass",
        safe: true,
        checkpoint: true
      };
    }

    // NORMAL LANE
    else {
      const isRoad = Math.random() < 0.6;

      world[y] = {
        type: isRoad ? "road" : "grass",
        safe: !isRoad,
        checkpoint: false,

        // ONE FIXED SPEED PER LANE
        dir: Math.random() < 0.5 ? -1 : 1,
        speed: 0.02 + Math.random() * 0.04,

        spawnRate: Math.random()
      };

      // spawn vehicles
      if (isRoad && world[y].spawnRate > 0.3) {
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
    }
  }

  return world[y];
}

// --------------------
// UPDATE
// --------------------
function update() {
  if (gameOver) return;

  cameraY = player.y * tileSize - 250;

  for (let v of vehicles) {
    v.x += v.dir * v.speed;

    if (v.x < -2) v.x = cols + 2;
    if (v.x > cols + 2) v.x = -2;

    // collision
    if (
      Math.floor(v.x) === player.x &&
      v.y === player.y
    ) {
      gameOver = true;

      document.getElementById("gameOverScreen").classList.remove("hidden");
      document.getElementById("finalScore").innerText = "Score: " + score;
    }
  }
}

// --------------------
// DRAW LANE
// --------------------
function drawLane(y, lane) {
  const sy = y * tileSize - cameraY;

  for (let x = 0; x < cols; x++) {

    // checkpoint visual
    if (lane.checkpoint) {
      ctx.fillStyle = "#2ecc71";
    } else {
      ctx.fillStyle = lane.type === "road" ? "#555" : "#3cb371";
    }

    ctx.fillRect(x * tileSize, sy, tileSize, tileSize);

    // road marking
    if (lane.type === "road") {
      ctx.fillStyle = "#777";
      ctx.fillRect(x * tileSize, sy + tileSize / 2 - 2, tileSize, 4);
    }
  }

  // checkpoint label
  if (lane.checkpoint) {
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("CHECKPOINT", 120, sy + 25);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, sy, canvas.width, tileSize);
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

  // body
  ctx.fillStyle = truck ? "#c0392b" : "#e74c3c";
  ctx.fillRect(x + ox, y + tileSize * 0.2, w, h);

  // cab
  ctx.fillStyle = "#922b21";

  if (v.dir > 0) {
    ctx.fillRect(x + ox + w * 0.65, y + tileSize * 0.25, w * 0.3, h * 0.5);
  } else {
    ctx.fillRect(x + ox + w * 0.05, y + tileSize * 0.25, w * 0.3, h * 0.5);
  }

  // windshield
  ctx.fillStyle = "#1c1c1c";

  if (v.dir > 0) {
    ctx.fillRect(x + ox + w * 0.7, y + tileSize * 0.28, w * 0.2, h * 0.4);
  } else {
    ctx.fillRect(x + ox + w * 0.1, y + tileSize * 0.28, w * 0.2, h * 0.4);
  }

  // wheels
  ctx.fillStyle = "#111";
  ctx.fillRect(x + ox + w * 0.15, y + tileSize * 0.75, 6, 6);
  ctx.fillRect(x + ox + w * 0.75, y + tileSize * 0.75, 6, 6);

  if (truck) {
    ctx.fillRect(x + ox + w * 0.35, y + tileSize * 0.75, 6, 6);
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

  // vehicles
  for (let v of vehicles) {
    drawVehicle(v);
  }

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
