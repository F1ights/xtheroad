body {
  margin: 0;
  text-align: center;
  font-family: Arial;
  background: #1e1e1e;
  color: white;
}

#game {
  width: 400px;
  height: 400px;
  margin: 10px auto;
  display: grid;
  grid-template-columns: repeat(10, 40px);
  grid-template-rows: repeat(10, 40px);
  border: 3px solid white;
}

.cell {
  width: 40px;
  height: 40px;
}

.grass { background: #2ecc71; }
.road { background: #555; }

.player {
  background: yellow;
  border-radius: 50%;
}

.car {
  background: red;
}

#controls {
  margin-top: 10px;
}

button {
  font-size: 20px;
  padding: 10px;
  margin: 3px;
}
