const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const multEl = document.getElementById("multiplier");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const GRID = 10;
const TILE = 40;

let running = false;
let score = 0;
let multiplier = 1;

// 🐸 PLAYER
let player = {
  x: 4,
  y: 9,
  tx: 4,
  ty: 9,
  t: 0,
  jumping: false
};

// WORLD
let lanes = [];

// CREATE LANES
function createLane(i) {
  const r = Math.random();

  let type =
    r < 0.4 ? "road" :
    r < 0.7 ? "river" :
    "grass";

  return {
    y: i,
    type,
    speed: (Math.random() * 0.8 + 0.3) * (Math.random() < 0.5 ? 1 : -1),

    objects: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      x: Math.random() * GRID,
      size: 1 + Math.floor(Math.random() * 2),
      coin: Math.random() < 0.25
    }))
  };
}

// INIT WORLD
for (let i = 0; i < 40; i++) {
  lanes.push(createLane(i));
}

// START
function startGame() {
  running = true;
  score = 0;
  multiplier = 1;

  player = { x: 4, y: 9, tx: 4, ty: 9, t: 0, jumping: false };

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
}

// GAME OVER
function gameOver() {
  running = false;
  finalScore.innerText = "Score: " + score;
  gameOverScreen.classList.remove("hidden");
}

// 🐸 MOVE (arc jump)
function move(dir) {
  if (!running || player.jumping) return;

  player.tx = player.x;
  player.ty = player.y;

  if (dir === "up") player.ty--;
  if (dir === "down") player.ty++;
  if (dir === "left") player.tx--;
  if (dir === "right") player.tx++;

  player.tx = Math.max(0, Math.min(GRID - 1, player.tx));
  player.ty = Math.max(0, Math.min(GRID - 1, player.ty));

  player.t = 0;
  player.jumping = true;
}

// UPDATE
function update(delta) {
  if (!running) return;

  // smooth jump
  if (player.jumping) {
    player.t += delta * 0.01;

    if (player.t >= 1) {
      player.x = player.tx;
      player.y = player.ty;
      player.jumping = false;

      score += 10 * multiplier;
    }
  }

  // move objects
  lanes.forEach(lane => {
    lane.objects.forEach(obj => {
      obj.x += lane.speed * 0.02;

      if (obj.x < -2) obj.x = GRID + 2;
      if (obj.x > GRID + 2) obj.x = -2;
    });
  });

  // scroll world
  if (player.y < 5) {
    lanes.unshift(createLane(lanes.length));
    lanes.pop();
    player.y++;
  }

  checkCollision();
}

// COLLISION FIXED (2D SAFE)
function checkCollision() {
  const lane = lanes[player.y];
  if (!lane) return;

  let onLog = false;

  lane.objects.forEach(obj => {

    const dx = Math.abs(obj.x - player.x);

    // 🚗 ROAD
    if (lane.type === "road") {
      if (dx < 0.5) {
        gameOver();
      }
    }

    // 🌊 RIVER (must be on log)
    if (lane.type === "river") {
      if (dx < 0.6) {
        onLog = true;

        // 🪵 carry player
        player.x += lane.speed * 0.02;
      }
    }

    // 🪙 COINS
    if (obj.coin && dx < 0.6) {
      obj.coin = false;
      score += 50 * multiplier;
      multiplier++;
    }
  });

  if (lane.type === "river" && !onLog) {
    gameOver();
  }
}

// DRAW TILE
function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // world
  lanes.forEach((lane, y) => {
    for (let x = 0; x < GRID; x++) {

      let color =
        lane.type === "road" ? "#444" :
        lane.type === "river" ? "#1e88e5" :
        "#2ecc71";

      drawTile(x, y, color);
    }

    // objects
    lane.objects.forEach(obj => {

      const px = obj.x * TILE;
      const py = y * TILE;

      ctx.fillStyle = lane.type === "road" ? "red" : "#8b4513";

      ctx.fillRect(px, py + 10, TILE * obj.size, 20);

      // coin
      if (obj.coin) {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(px + 20, py + 20, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  // 🐸 player (arc jump)
  let px = player.x + (player.tx - player.x) * player.t;
  let py = player.y + (player.ty - player.y) * player.t;

  let lift = Math.sin(player.t * Math.PI) * 15;

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(px * TILE + 20, py * TILE + 20 - lift, 12, 0, Math.PI * 2);
  ctx.fill();

  // UI
  scoreEl.innerText = "Score: " + score;
  multEl.innerText = "x" + multiplier;
}

// LOOP
let last = 0;

function loop(t) {
  let delta = t - last;
  last = t;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
