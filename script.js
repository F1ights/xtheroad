const circle = document.getElementById("circle");
const scoreDisplay = document.getElementById("score");
const gameArea = document.getElementById("game-area");

let score = 0;
let speed = 1200; // starting speed

function moveCircle() {
  const maxX = gameArea.clientWidth - 60;
  const maxY = gameArea.clientHeight - 60;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  circle.style.left = x + "px";
  circle.style.top = y + "px";
}

function gameLoop() {
  moveCircle();

  setTimeout(gameLoop, speed);
}

circle.addEventListener("click", () => {
  score++;
  scoreDisplay.textContent = "Score: " + score;

  // make game harder
  if (speed > 400) speed -= 30;

  moveCircle();
});

gameLoop();
