const game = document.getElementById("game");

const size = 10;

// create grid
let grid = [];

let player = { x: 4, y: 9 };

// simple cars
let cars = [
  { x: 0, y: 2, dir: 1 },
  { x: 5, y: 5, dir: -1 }
];

function createGrid() {
  game.innerHTML = "";
  grid = [];

  for (let y = 0; y < size; y++) {
    let row = [];
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");

      cell.classList.add("cell");

      if (y < 3 || y > 6) {
        cell.classList.add("grass");
      } else {
        cell.classList.add("road");
      }

      game.appendChild(cell);
      row.push(cell);
    }
    grid.push(row);
  }
}

function drawPlayer() {
  grid[player.y][player.x].classList.add("player");
}

function drawCars() {
  cars.forEach(car => {
    grid[car.y][car.x].classList.add("car");
  });
}

function updateCars() {
  cars.forEach(car => {
    car.x += car.dir;

    if (car.x >= size) car.x = 0;
    if (car.x < 0) car.x = size - 1;
  });
}

function clearGrid() {
  grid.forEach(row => {
    row.forEach(cell => {
      cell.classList.remove("player", "car");
    });
  });
}

function checkCollision() {
  cars.forEach(car => {
    if (car.x === player.x && car.y === player.y) {
      alert("Game Over!");
      player = { x: 4, y: 9 };
    }
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") player.y--;
  if (e.key === "ArrowDown") player.y++;
  if (e.key === "ArrowLeft") player.x--;
  if (e.key === "ArrowRight") player.x++;

  // boundaries
  player.x = Math.max(0, Math.min(size - 1, player.x));
  player.y = Math.max(0, Math.min(size - 1, player.y));
});

function gameLoop() {
  clearGrid();
  updateCars();
  drawPlayer();
  drawCars();
  checkCollision();
}

createGrid();
setInterval(gameLoop, 400);
