const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const tileSize = 40;
const rows = 15;
const cols = 10;

let player = { x: 5, y: 13, anim: 0 };
let balls = [];
let frame = 0;
let gameOver = false;

// generate lanes
let map = [];
for (let y = 0; y < rows; y++) {
  map[y] = {
    type: y % 2 === 0 ? "grass" : "sand"
  };
}

// spawn rolling balls
function spawnBall() {
  balls.push({
    x: Math.random() < 0.5 ? 0 : cols,
    y: Math.floor(Math.random() * rows),
    dir: Math.random() < 0.5 ? 1 : -1,
    speed: 0.05 + Math.random() * 0.05
  });
}

setInterval(spawnBall, 1200);

// input
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
});

window.move = function(dir) {
  if (gameOver) return;

  if (dir === "up") player.y--;
  if (dir === "down") player.y++;
  if (dir === "left") player.x--;
  if (dir === "right") player.x++;

  player.x = Math.max(0, Math.min(cols - 1, player.x));
  player.y = Math.max(0, Math.min(rows - 1, player.y));

  player.anim = 5;
};

// update
function update() {
  frame++;

  // balls movement
  balls.forEach(b => {
    b.x += b.dir * b.speed;

    if (b.x < -1) b.x = cols;
    if (b.x > cols + 1) b.x = -1;

    // collision
    if (
      Math.floor(b.x) === player.x &&
      b.y === player.y
    ) {
      gameOver = true;
    }
  });

  if (player.anim > 0) player.anim--;
}

// draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // map
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = map[y].type === "grass" ? "#3cb371" : "#d2b48c";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  // player (simple animated circle)
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(
    player.x * tileSize + tileSize / 2,
    player.y * tileSize + tileSize / 2 - player.anim,
    tileSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // balls (rolling obstacle)
  balls.forEach(b => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      b.x * tileSize + tileSize / 2,
      b.y * tileSize + tileSize / 2,
      tileSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", 100, 300);
  }
}

// loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
