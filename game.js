const board = document.getElementById("board");
const inputTam = document.getElementById("tam");
const btnSend = document.getElementById("send");
const btnStop = document.getElementById("stop");
const stNN = document.getElementById("nn");
document.getElementById("A+").addEventListener("click", autoMoveXmas);
document.getElementById("nn").addEventListener("click", autoMoveNn);

let state = {
  n: 5,
  snake: [],
  dir: [0, 1],
  food: null,
  running: false,
};
dimension = state.n;
//------------------------------------------------------------
function idxToRC(idx, n) {
  const row = Math.floor(idx / n) + 1; // +1 para que empiece en 1
  const col = (idx % n) + 1; // +1 para que empiece en 1
  return [row, col];
};
function rcToIdx([r, c], n) {
  //revisar despues
  return r * n + c;
};
function simularTecla(key) {
  const event = new KeyboardEvent("keydown", {
    key: key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
};
function getAccion(probabilidades) {
  const acciones = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const valorMax = Math.max(...probabilidades);
  const indiceMax = probabilidades.indexOf(valorMax);

  if (indiceMax !== -1 && indiceMax < acciones.length) {
    return acciones[indiceMax];
  } else {
    // Manejo de errores si el array está vacío o algo sale mal.
    return "Error: Índice inválido o array de probabilidades vacío.";
  }
};
function genState(py, fr, body) {
  //completo
  let Bpy = Array.from({ length: dimension }, () => Array(dimension).fill(0)); //cabeza
  let Bfr = Array.from({ length: dimension }, () => Array(dimension).fill(0)); //cuerpo
  let Bcola = Array.from({ length: dimension }, () => Array(dimension).fill(0)); //cola

  Bpy[py[0] - 1][py[1] - 1] = 1;
  Bfr[fr[0] - 1][fr[1] - 1] = 1;
  body.forEach((segmento) => {
    Bcola[segmento[0] - 1][segmento[1] - 1] = 1;
  });

  
  let vector = [...Bpy.flat(), ...Bfr.flat(), ...Bcola.flat()];
  return vector;
};
function genVisor(py, fr, body) {
  //completo
  let Bpy = Array.from({ length: dimension }, () => Array(dimension).fill(0)); //cabeza

  Bpy[py[0] - 1][py[1] - 1] = 0;
  Bpy[fr[0] - 1][fr[1] - 1] = '🍎';
  body.forEach((segmento) => {
    Bpy[segmento[0] - 1][segmento[1] - 1] = 1;
  });

  console.table( Bpy );
};
//------------------------------------------------------------
function autoMoveXmas() {
  if (!state.running) return;
  const py = idxToRC(state.snake[0], state.n);
  const fr = idxToRC(state.food, state.n);

  let body = state.snake.slice(1).map((i) => idxToRC(i, state.n));
  
  // let estado= genState(py,fr,body);
  // let dirBin= forwardPass(pesos,estado,'softmax').salida;
  // let dir= getAccion(dirBin);

  let entorno= {
    py:py, fr:fr, body, dimension:state.n
  }
  const dir = Axmas(entorno);//recibe muchos tamaños

  if (dir !== 6) {
    simularTecla(dir);
    setTimeout(autoMoveXmas, 120);
  } else {
    stopGame();
  }
};
function autoMoveNn() {
  if (!state.running) return;
  const py = idxToRC(state.snake[0], state.n);
  const fr = idxToRC(state.food, state.n);

  let body = state.snake.slice(1).map((i) => idxToRC(i, state.n));
  
  let estado= genState(py,fr,body);
  let dirBin= forwardPass(pesos,estado,'softmax').salida;
  let dir= getAccion(dirBin);

  if (dir !== 6) {
    simularTecla(dir);
    setTimeout(autoMoveNn, 120);
  } else {
    stopGame();
  }
};
//------------------------------------------------------------
state = {
  n: 5,
  snake: [],
  dir: [0, 1],
  food: null,
  running: false,
};
function buildBoard(n) {
  state.n = n;
  document.documentElement.style.setProperty("--cols", n);
  board.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n * n; i++) {
    const cell = document.createElement("div");
    cell.innerText = idxToRC(i, state.n);
    cell.className = "cell";
    cell.dataset.idx = i;
    frag.appendChild(cell);
  }
  board.appendChild(frag);
};
function getCell(idx) {
  return board.querySelector(`.cell[data-idx="${idx}"]`);
};
function startGame() {
  resetState();
  placeFood();
  state.running = true;
};
function stopGame() {
  state.running = false;
};
function resetState() {
  document.querySelectorAll(".cell").forEach((c) => (c.className = "cell"));
  const mid = Math.floor(state.n / 2) * state.n + Math.floor(state.n / 2);
  state.snake = [mid];
  state.dir = [0, 1];
  state.food = null;
  getCell(mid).classList.add("snake", "head"); // cabeza inicial
};
function move(dir) {
  if (!state.running) return;

  const head = state.snake[0];
  const row = Math.floor(head / state.n);
  const col = head % state.n;
  const [dr, dc] = dir;

  let newRow = row + dr;
  let newCol = col + dc;

  // 🚧 Paredes como obstáculo
  if (newRow < 0 || newRow >= state.n || newCol < 0 || newCol >= state.n) {
    stopGame();
    // alert('Game Over (pared)');
    return;
  }

  const newIdx = newRow * state.n + newCol;

  // Colisión con sí mismo
  if (state.snake.includes(newIdx)) {
    stopGame();
    // alert('Game Over (colisión)');
    return;
  }
  const ate = newIdx === state.food;
  state.snake.unshift(newIdx);
  getCell(newIdx).classList.add("snake", "head");

  // Quitar "head" de la anterior
  if (state.snake.length > 1) {
    getCell(state.snake[1]).classList.remove("head");
  }
  if (ate) {
    // 🔴 limpiar fruta
    getCell(newIdx).classList.remove("food");
    placeFood();
  } else {
    // Si no comió, quitar cola
    const tail = state.snake.pop();
    getCell(tail).className = "cell";
  }
  getBoardMatrix(state);
};
function placeFood() {
  let idx;
  do {
    idx = Math.floor(Math.random() * state.n * state.n);
  } while (state.snake.includes(idx));
  state.food = idx;
  getCell(idx).classList.add("food");
};
function getBoardMatrix(state) {// esta funcion crea la matriz para un modelo(actorCritic) de IA(usa cnn y nn) que planeo entrenar
  const n = state.n;
  const size = n + 2; // incluir borde
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < size; i++) {
    matrix[0][i] = -1;
    matrix[size - 1][i] = -1;
    matrix[i][0] = -1;
    matrix[i][size - 1] = -1;
  }
  function idxToRC(idx, n) {
    return [Math.floor(idx / n), idx % n];
  }
  const [foodRow, foodCol] = idxToRC(state.food, n);
  matrix[foodRow + 1][foodCol + 1] = 1; // +1 por borde
  const L = state.snake.length;
  state.snake.forEach((idx, i) => {
    const [row, col] = idxToRC(idx, n);
    if (i === 0) {5
      matrix[row + 1][col + 1] = 0.5;
    } else {
      const bodyValue = 0.2 + ((L - i - 1) / (L - 1)) * 0.3;
      matrix[row + 1][col + 1] = parseFloat(bodyValue.toFixed(2));
    }
  });
  return matrix;
};
window.addEventListener("keydown", (e) => {
  if (!state.running) return;
  if (e.key === "ArrowUp") move([-1, 0]);
  if (e.key === "ArrowDown") move([1, 0]);
  if (e.key === "ArrowLeft") move([0, -1]);
  if (e.key === "ArrowRight") move([0, 1]);
});
btnSend.addEventListener("click", () => {
  const val = parseInt(inputTam.value, 10);
  if (!Number.isInteger(val) || val <= 0) return;
  const n = val > 101 ? 101 : val % 2 === 0 ? val - 1 : val;
  buildBoard(n);
  startGame();
});

btnStop.addEventListener("click", stopGame);
// ejecutarNN.addEventListener('click', NN);
buildBoard(state.n);
startGame();


