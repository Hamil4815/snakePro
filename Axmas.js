function rutaStr(coors) {
  let movs = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  // let movs= [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
  let res = [];
  for (let i = 0; i < coors.length - 1; i++) {
    if (coors[i][0] > coors[i + 1][0]) {
      //ir abajo
      res.push(movs[0]);
    }
    if (coors[i][0] < coors[i + 1][0]) {
      res.push(movs[1]);
    }
    if (coors[i][1] > coors[i + 1][1]) {
      res.push(movs[2]);
    }
    if (coors[i][1] < coors[i + 1][1]) {
      res.push(movs[3]);
    }
  }

  return res;
}
function buscaRuta(nodos) {
  // console.log(nodos)
  let idFinal = nodos[nodos.length - 1].id;
  const ruta = [];
  let nodoActual = nodos.find((n) => n.id === idFinal);

  while (nodoActual) {
    ruta.unshift(nodoActual.dir); // Agrega solo la dirección al inicio de la ruta
    if (nodoActual.padre === 0) break; // Si el padre es 0, hemos alcanzado el inicio
    nodoActual = nodos.find((n) => n.id === nodoActual.padre); // Encuentra el nodo padre
  }
  // console.log(ruta)
  return ruta;
}
function estoy(arr, x) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].dir[0] == x.dir[0] && arr[i].dir[1] == x.dir[1]) {
      // console.log('se repite',arr[i].g,x.g )
      return arr[i];
    }
  }
  return false;
}
function agregar(nums) {
  return nums.pop();
}
function dis(p1, p2, costo) {
  const dx = Math.abs(p1[0] - p2[0]);
  const dy = Math.abs(p1[1] - p2[1]);

//   return dx + dy; //manhatan
  // return (dx + dy).toFixed(2)
//   return Math.sqrt(dx * dx + dy * dy)*costo// euclidian
  return ((Math.sqrt(dx * dx + dy * dy))*costo).toFixed(2)
}
function ajustaBodySet(bodyMap, pasos) {
  const filteredEntries = Array.from(bodyMap.entries()).filter(
    ([key, value]) => {
      return value > pasos;
    }
  );

  // Creamos un nuevo Map con los elementos filtrados
  return new Map(filteredEntries);
}
function Axmas(entorno) {
  let {py, fr, body,dimension}= entorno;
  function vecinos(d, padre, g) {
    const movimientos = [
      {
        dir: [d[0] - 1, d[1]],
        id: agregar(nums),
        padre,
        g: g + 10,
        h: 0,
        f: 0,
      },
      {
        dir: [d[0], d[1] + 1],
        id: agregar(nums),
        padre,
        g: g + 10,
        h: 0,
        f: 0,
      },
      {
        dir: [d[0] + 1, d[1]],
        id: agregar(nums),
        padre,
        g: g + 10,
        h: 0,
        f: 0,
      },
      {
        dir: [d[0], d[1] - 1],
        id: agregar(nums),
        padre,
        g: g + 10,
        h: 0,
        f: 0,
      },
    ];
    let bodyMapMOv = ajustaBodySet(bodyMap, g / 10);
    return movimientos.filter((obj) => {
      let dirKey = `${obj.dir[0]}-${obj.dir[1]}`;
      let dentroLimites =
        obj.dir[0] >= 1 &&
        obj.dir[0] <= dimension &&
        obj.dir[1] >= 1 &&
        obj.dir[1] <= dimension;
      // Aquí verificamos si la posición está bloqueada por el cuerpo y cuándo se liberará
      let bodyBlocked = bodyMapMOv.has(dirKey) && bodyMapMOv.get(dirKey);

      // Permitimos moverse a lugares que no están bloqueados o que estarán liberados pronto
      return !bodyBlocked && !cerradaSet.has(dirKey) && dentroLimites;
    });
  }
  //nuevo
  let abierta = [];
  let cerrada = [];
  let limite = 1000;
  let costoPaso = 81; // costo ideal 21 o aun mejor 31, pero se conservador con 21
  const nums = [...Array(10000).keys()].map((i) => 10001 - i);
  let contador = 0;
  let cerradaSet = new Set();
  let bodyMap = new Map();
  body.forEach((b, i) => {
    bodyMap.set(`${b[0]}-${b[1]}`, i + 1);
  });
  let desde = body.length;
  let hh = dis(py, fr, costoPaso);
  abierta.push({ dir: py, id: 1, padre: 0, g: 0, h: hh, f: hh });
  while (true) {
    let sigo;
    if (abierta.length > 0) {
      // actualizarCuerpo()
      let neig = vecinos(abierta[0].dir, abierta[0].id, abierta[0].g);
      neig.forEach((x) => {
        let esta = estoy(abierta, x);
        if (!esta) {
          let h = dis(x.dir, fr, costoPaso);
          x.h = h;
          x.f = h + x.g;
          abierta.push(x);
        }
      });

      // console.log( 'evaluando',abierta[0].dir )
      // console.log( bodyMap )
      // Mueve el nodo de abierta a cerrada y actualiza el Set
      let nodoCerrado = abierta.shift();
      cerrada.push(nodoCerrado);
      cerradaSet.add(`${nodoCerrado.dir[0]}-${nodoCerrado.dir[1]}`);

      // Ordena la lista de abierta por el valor de f
      abierta.sort((a, b) => a.f - b.f);
    }

    contador++;
    // actualizarCuerpo() // Libera posiciones ocupadas por el cuerpo

    // Verifica si alcanzamos la fruta o si llegamos al límite
    for (const key in cerrada) {
      if (cerrada[key].dir[0] === fr[0] && cerrada[key].dir[1] === fr[1]) {
        sigo = 1;
      }
    }
    if (sigo === 1 || contador >= limite) {
      if (contador == limite) {
        break;
      } else break;
    }
  }
  let arr = buscaRuta(cerrada);
//   console.log(arr);
  if (arr.length >= 2) {
    let sali = rutaStr(arr.slice(0, 2));
    return sali[0];
  } else {
    // console.log("sin movimiento");
    return 6;
  }
}
// module.exports= {
//   rutaStr,
//   buscaRuta,
//   estoy,
//   dis,
//   ajustaBodySet,
//   Axmas
// }