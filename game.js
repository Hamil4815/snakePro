const board = document.getElementById("board");
const btnStop = document.getElementById("stop");
const sizeBtns = document.querySelectorAll(".size-btn");
const statusText = document.getElementById("status-text");
const ejecutar = document.getElementById("ejecutar");
const algoSelect = document.getElementById("busqueda");

// Listeners de Algoritmos (Verifica que existan en el HTML)
if (document.getElementById("A+"))
  document.getElementById("A+").addEventListener("click", () => {
    statusText.style.color = "#087a28ff";
    statusText.innerText = "Ejecutando: A* Search";
    autoMoveXmas();
  });

if (document.getElementById("nn"))
  document.getElementById("nn").addEventListener("click", () => {
    statusText.innerText = "Ejecutando: Red Neuronal";
    autoMoveNn();
  });

let state = {
  n: 5, // Empezamos con medio
  snake: [],
  dir: [0, 1],
  food: null,
  running: false,// Indica si el juego está en ejecución
};

// ----------------------
// Lógica de Renderizado
// ----------------------

function buildBoard(n) {
  state.n = n;
  // Actualizamos la variable CSS para el grid
  document.documentElement.style.setProperty("--cols", n);

  board.innerHTML = "";
  const frag = document.createDocumentFragment();

  for (let i = 0; i < n * n; i++) {
    const cell = document.createElement("div");
    // El texto ahora está oculto por CSS a menos que debug-mode esté activo
    cell.innerText = idxToRC(i, state.n);
    cell.className = "cell";
    cell.dataset.idx = i;
    frag.appendChild(cell);
  }
  board.appendChild(frag);
}

function getCell(idx) {
  return board.querySelector(`.cell[data-idx="${idx}"]`);
}

// ----------------------
// Lógica de Juego
// ----------------------

function startGame() {
  resetState();
  placeFood();
  state.running = true;
  statusText.innerText = "En ejecución...";
  statusText.style.color = "#00e676";
}

function stopGame() {
  if (state.running==false) {
    state.running = true;
    statusText.innerText = "En ejecución...";
    statusText.style.color = "#087a28ff";
  }else{
    state.running = false;
    statusText.innerText = "Pausado";
    statusText.style.color = "#ff5252";
  }
  // state.running = false;
}

function resetState() {
  document.querySelectorAll(".cell").forEach((c) => (c.className = "cell"));

  // Cálculo exacto del centro para tableros impares
  const centerRow = Math.floor(state.n / 2);
  const centerCol = Math.floor(state.n / 2);
  const mid = centerRow * state.n + centerCol;

  state.snake = [mid];
  state.dir = [0, 1];
  state.food = null;

  const headCell = getCell(mid);
  if (headCell) headCell.classList.add("snake", "head");
}

function placeFood() {
  let idx;
  // Protección contra bucles infinitos si el tablero está lleno
  let attempts = 0;
  const maxAttempts = state.n * state.n;

  do {
    idx = Math.floor(Math.random() * state.n * state.n);
    attempts++;
  } while (state.snake.includes(idx) && attempts < maxAttempts);

  if (attempts < maxAttempts) {
    state.food = idx;
    getCell(idx).classList.add("food");
  } else {
    stopGame();
    alert("¡Victoria! Tablero lleno.");
  }
}

function move(dir) {
  if (!state.running) return;

  const head = state.snake[0];
  const row = Math.floor(head / state.n);
  const col = head % state.n;
  const [dr, dc] = dir;

  let newRow = row + dr;
  let newCol = col + dc;

  // 🚧 Paredes
  if (newRow < 0 || newRow >= state.n || newCol < 0 || newCol >= state.n) {
    stopGame();
    return;
  }

  const newIdx = newRow * state.n + newCol;

  // Colisión cuerpo
  if (state.snake.includes(newIdx)) {
    stopGame();
    return;
  }

  const ate = newIdx === state.food;
  state.snake.unshift(newIdx);

  // Visualización Cabeza
  getCell(newIdx).classList.add("snake", "head");

  // Quitar "head" de la anterior
  if (state.snake.length > 1) {
    getCell(state.snake[1]).classList.remove("head");
  }

  if (ate) {
    getCell(newIdx).classList.remove("food");
    placeFood();
  } else {
    const tail = state.snake.pop();
    getCell(tail).className = "cell"; // Reset clase
  }

  // Aquí llamarías a tu getBoardMatrix(state) si necesitas logs
}

// ----------------------
// Helpers Matemáticos
// ----------------------
function idxToRC(idx, n) {
  const row = Math.floor(idx / n) + 1;
  const col = (idx % n) + 1;
  return [row, col];
}

function rcToIdx([r, c], n) {
  return (r - 1) * n + (c - 1); // Ajustado para índices base-0 si idxToRC es base-1
}

function simularTecla(key) {
  const event = new KeyboardEvent("keydown", {
    key: key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

// Funciones Auxiliares para tus IAs (mantenidas del original)
function getAccion(probabilidades) {
  const acciones = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const valorMax = Math.max(...probabilidades);
  const indiceMax = probabilidades.indexOf(valorMax);
  return indiceMax !== -1 && indiceMax < acciones.length ? acciones[indiceMax] : "Error";
}

function genState(py, fr, body) {
  // Nota: Asegúrate que 'dimension' esté definida globalmente o pásala como argumento
  let dim = state.n;
  let Bpy = Array.from({ length: dim }, () => Array(dim).fill(0));
  let Bfr = Array.from({ length: dim }, () => Array(dim).fill(0));
  let Bcola = Array.from({ length: dim }, () => Array(dim).fill(0));

  // Validaciones para evitar crash si index sale de rango
  if (py[0] > 0 && py[1] > 0) Bpy[py[0] - 1][py[1] - 1] = 1;
  if (fr[0] > 0 && fr[1] > 0) Bfr[fr[0] - 1][fr[1] - 1] = 1;

  body.forEach((segmento) => {
    if (segmento[0] > 0 && segmento[1] > 0)
      Bcola[segmento[0] - 1][segmento[1] - 1] = 1;
  });

  return [...Bpy.flat(), ...Bfr.flat(), ...Bcola.flat()];
}

// Las funciones autoMoveXmas y autoMoveNn se mantienen igual, 
// solo asegúrate de que accedan a `state` correctamente.

// ----------------------
function autoMoveXmas() {
  const py = idxToRC(state.snake[0], state.n);
  const fr = idxToRC(state.food, state.n);
  let body = state.snake.slice(1).map((i) => idxToRC(i, state.n));
  let entorno = {
    py: py, fr: fr, body, dimension: state.n
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

  let estado = genState(py, fr, body);
  let dirBin = forwardPass(pesos, estado, 'softmax').salida;
  let dir = getAccion(dirBin);

  if (dir !== 6) {
    simularTecla(dir);
    setTimeout(autoMoveNn, 120);
  } else {
    stopGame();
  }
};
// ----------------------

// Selector de Tamaño
sizeBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    // UI Update
    sizeBtns.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    // Logic Update
    const newSize = parseInt(e.target.dataset.size);
    stopGame();
    buildBoard(newSize);
    startGame();
  });
});

btnStop.addEventListener("click", () => {
  stopGame();
  // resetState(); // Opcional: limpiar tablero al parar
  // statusText.innerText = "Reiniciado";
});

window.addEventListener("keydown", (e) => {
  // Prevenir scroll con flechas
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  if (!state.running) return;
  if (e.key === "ArrowUp" && state.dir[0] !== 1) { state.dir = [-1, 0]; move([-1, 0]); }
  if (e.key === "ArrowDown" && state.dir[0] !== -1) { state.dir = [1, 0]; move([1, 0]); }
  if (e.key === "ArrowLeft" && state.dir[1] !== 1) { state.dir = [0, -1]; move([0, -1]); }
  if (e.key === "ArrowRight" && state.dir[1] !== -1) { state.dir = [0, 1]; move([0, 1]); }
});
// algoSelect.addEventListener("change", () => {
//   if (algoSelect.value === "xmas") autoMoveXmas();
//   if (algoSelect.value === "nn") autoMoveNn();
// });

ejecutar.addEventListener("click", () => {
  // console.log( 'hey',algoSelect.value );
  if (algoSelect.value === "Axmas") autoMoveXmas();
  if (algoSelect.value === "nn") autoMoveNn();
})
// Inicialización
buildBoard(state.n);
startGame();
