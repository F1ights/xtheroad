const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const tileSize = 40;
const cols = 10;

let cameraY = 0;
let score = 0;
let gameOver = false;

let player = { x: 5, y: 0 };

let world = {};
let cars = [];

// ----------------------
// lane generator
// ----------------------
function getLane(y) {
  if (!world[y]) {
    const isRoad = Math.random() < 0.55;

    world[y] = {
      type: isRoad ? "road" : "grass",
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.03 + Math.random() * 0.04,
      spawnRate: Math.random()
    };

    // spawn cars only on road
    if (isRoad && world[y].spawnRate > 0.3) {
      const count = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < count; i++) {
        cars.push({
          x: Math.random() * cols,
          y: y,
          dir: world[y].dir,
          speed: world[y].speed
        });
      }
    }
  }
  return world[y];
}

// ----------------------
// controls
// ----------------------
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
};

// ----------------------
// restart
// ----------------------
window.restartGame = function () {
  player = { x: 5, y: 0 };
  cameraY = 0;
  score = 0;
  gameOver = false;
  world = {};
  cars = [];
  document.getElementById("restart").style.display = "none";
};

// ----------------------
// update
// ----------------------
function update() {
  if (gameOver) return;

  cameraY = player.y * tileSize - 200;

  for (let car of cars) {
    car.x += car.dir * car.speed;

    if (car.x < -2) car.x = cols + 2;
    if (car.x > cols + 2) car.x = -2;

    // collision
    if (
      Math.floor(car.x) === player.x &&
      car.y === player.y
    ) {
      gameOver = true;
      document.getElementById("restart").style.display = "block";
    }
  }
}

// ----------------------
// draw car (rect + windshield)
// ----------------------
function drawCar(car, yOffset) {
  const x = car.x * tileSize;
  const y = car.y * tileSize - cameraY + yOffset;

  const w = tileSize * 0.9;
  const h = tileSize * 0.6;

  // body
  ctx.fillStyle = "red";
  ctx.fillRect(x, y + tileSize * 0.2, w, h);

  // windshield (front depends on direction)
  ctx.fillStyle = "#222";

  if (car.dir > 0) {
    // facing right
    ctx.fillRect(x + w * 0.6, y + tileSize * 0.25, w * 0.3, h * 0.5);
  } else {
    // facing left
    ctx.fillRect(x + w * 0.1, y + tileSize * 0.25, w * 0.3, h * 0.5);
  }
}

// ----------------------
// draw
// ----------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startY = Math.floor(cameraY / tileSize);
  const endY = startY + 20;

  // lanes
  for (let y = startY; y < endY; y++) {
    const lane = getLane(y);

    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = lane.type === "road" ? "#555" : "#3cb371";
      ctx.fillRect(
        x * tileSize,
        y * tileSize - cameraY,
        tileSize,
        tileSize
      );

      // road lane marking
      if (lane.type === "road") {
        ctx.fillStyle = "#777";
        ctx.fillRect(
          x * tileSize,
          y * tileSize - cameraY + tileSize / 2 - 2,
          tileSize,
          4
        );
      }
    }
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

  // cars
  for (let car of cars) {
    drawCar(car, 0);
  }

  // game over text
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("CRASH!", 140, 300);
  }
}

// ----------------------
// loop
// ----------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
