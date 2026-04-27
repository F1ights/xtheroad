const game = document.getElementById("game");
const player = document.getElementById("player");

let px = 190;
let py = 560;

// Move player
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") py -= 40;
  if (e.key === "ArrowDown") py += 40;
  if (e.key === "ArrowLeft") px -= 40;
  if (e.key === "ArrowRight") px += 40;

  player.style.left = px + "px";
  player.style.top = py + "px";
});

// Create obstacles
function spawnObstacle() {
  const obs = document.createElement("div");
  obs.classList.add("obstacle");

  let x = Math.floor(Math.random() * 12) * 30;
  let y = -30;

  obs.style.left = x + "px";
  obs.style.top = y + "px";

  game.appendChild(obs);

  // Move obstacle
  let move = setInterval(() => {
    y += 5;
    obs.style.top = y + "px";

    // Collision
    if (
      px < x + 30 &&
      px + 20 > x &&
      py < y + 30 &&
      py + 20 > y
    ) {
      alert("Game Over!");
      location.reload();
    }

    // Remove off-screen
    if (y > 600) {
      clearInterval(move);
      obs.remove();
    }
  }, 30);
}

// Spawn every second
setInterval(spawnObstacle, 1000);
