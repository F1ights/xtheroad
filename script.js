const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreBoard = document.getElementById("score");

const TILE = 40;
const ROWS = 10;
const COLS = 10;

let score = 0;

// PLAYER
let player = {
  x: 4,
  y: 9,
  targetX: 4,
  targetY: 9,
  moving: false,
  progress: 0
};

// LANES
let lanes = [];

function createLane(i) {
  const type = Math.random() < 0.5 ? "road" : Math.random() < 0.5 ? "river" : "grass";

  return {
    y: i,
    type,
    speed: (Math.random() * 1 + 0.5) * (Math.random() < 0.5 ? 1 : -1),
    objects: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
      x: Math.random() * COLS
    }))
  };
}

for (let i = 0; i < 30; i++) {
  lanes.push(createLane(i));
}

// MOVE
function move(dir) {
  if (player.moving) return;

  player.targetX = player.x;
  player.targetY = player.y;

  if (dir === "up") player.targetY--;
  if (dir === "down") player.targetY++;
  if (dir === "left") player.targetX--;
  if (dir === "right") player.targetX++;

  player.targetX = Math.max(0, Math.min(COLS - 1, player.targetX));
  player.targetY = Math.max(0, Math.min(ROWS - 1, player.targetY));

  player.moving = true;
  player.progress = 0;
}

// UPDATE
function update(delta) {
  if (player.moving) {
    player.progress += delta * 0.01;

    if (player.progress >= 1) {
      player.x = player.targetX;
      player.y = player.targetY;
      player.moving = false;

      score++;
    }
  }

  lanes.forEach(lane => {
    lane.objects.forEach(obj => {
      obj.x += lane.speed * 0.02;

      if (obj.x < -1) obj.x = COLS + 1;
      if (obj.x > COLS + 1) obj.x = -1;
    });
  });

  if (player.y < 5) {
    lanes.unshift(createLane(lanes.length));
    lanes.pop();
    player.y++;
  }

  checkCollision();
}

// COLLISION
function checkCollision() {
  const lane = lanes[player.y];

  lane.objects.forEach(obj => {
    if (Math.floor(obj.x) === player.x) {
      alert("💥 Game Over! Score: " + score + "\nTry again in X the Road");
      resetGame();
    }
  });
}

// RESET
function resetGame() {
  player.x = 4;
  player.y = 9;
  player.targetX = 4;
  player.targetY = 9;
  score = 0;
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lanes.forEach((lane, y) => {
    for (let x = 0; x < COLS; x++) {
      if (lane.type === "road") ctx.fillStyle = "#444";
      else if (lane.type === "river") ctx.fillStyle = "#3498db";
      else ctx.fillStyle = "#2ecc71";

      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

    lane.objects.forEach(obj => {
      ctx.fillStyle = lane.type === "road" ? "red" : "#8b4513";
      ctx.fillRect(obj.x * TILE, y * TILE, TILE, TILE);
    });
  });

  let px = player.x + (player.targetX - player.x) * player.progress;
  let py = player.y + (player.targetY - player.y) * player.progress;

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(px * TILE + 20, py * TILE + 20, 15, 0, Math.PI * 2);
  ctx.fill();

  scoreBoard.innerText = "Score: " + score;
}

// LOOP
let lastTime = 0;

function loop(time) {
  const delta = time - lastTime;
  lastTime = time;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
