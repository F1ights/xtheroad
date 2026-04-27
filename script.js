const game = document.getElementById("game");
const scoreBoard = document.getElementById("score");

const size = 10;

let worldOffset = 0;
let score = 0;

let player = { x: 4, y: 9 };

let lanes = [];

// generate infinite lanes
function generateLane(index) {
  return {
    y: index,
    type: Math.random() > 0.5 ? "road" : "grass",
    speed: Math.random() > 0.5 ? 1 : -1,
    cars: Math.random() > 0.5 ? [
      { x: Math.floor(Math.random() * size) }
    ] : []
  };
}

// create initial world
for (let i = 0; i < 20; i++) {
  lanes.push(generateLane(i));
}

// render grid
function render() {
  game.innerHTML = "";

  for (let y = 0; y < size; y++) {
    let lane = lanes[y + worldOffset];

    for (let x = 0; x < size; x++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");

      if (lane.type === "road") cell.classList.add("road");
      else cell.classList.add("grass");

      // draw cars
      lane.cars.forEach(car => {
        if (car.x === x) cell.classList.add("car");
      });

      // draw player
      if (player.x === x && player.y === y) {
        cell.classList.add("player");
      }

      game.appendChild(cell);
    }
  }

  scoreBoard.innerText = "Score: " + score;
}

// move cars
function updateCars() {
  lanes.forEach(lane => {
    if (lane.type === "road") {
      lane.cars.forEach(car => {
        car.x += lane.speed;

        if (car.x < 0) car.x = size - 1;
        if (car.x >= size) car.x = 0;
      });
    }
  });
}

// collision check
function checkCollision() {
  let lane = lanes[player.y + worldOffset];

  lane.cars.forEach(car => {
    if (car.x === player.x) {
      alert("Game Over! Score: " + score);
      resetGame();
    }
  });
}

// scrolling system
function scrollWorld() {
  if (player.y < 5) {
    worldOffset++;
    player.y++;
    score++;
    lanes.push(generateLane(lanes.length));
  }
}

// reset
function resetGame() {
  player = { x: 4, y: 9 };
  worldOffset = 0;
  score = 0;
}

// keyboard controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
});

// mobile controls
function move(dir) {
  if (dir === "up") player.y--;
  if (dir === "down") player.y++;
  if (dir === "left") player.x--;
  if (dir === "right") player.x++;

  player.x = Math.max(0, Math.min(size - 1, player.x));
  player.y = Math.max(0, Math.min(size - 1, player.y));
}

// game loop
function loop() {
  updateCars();
  scrollWorld();
  checkCollision();
  render();
}

setInterval(loop, 300);
render();
