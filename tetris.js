const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');

// Escala del tamaño de los bloques
const scale = 20;
context.scale(scale, scale);

// Configuración del tablero de juego
const ROWS = 20;
const COLUMNS = 10;

// Colores para cada tipo de pieza
const colors = [
    'red',
    'blue',
    'purple',
    'yellow',
    'green',
    'cyan',
    'orange'
];

let score = 0;

// Función para dibujar una pieza en el tablero
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Pieza de ejemplo
const piece = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

// Posición inicial de la pieza
const piecePosition = { x: 3, y: 0 };

const pieces = 'TJLOSZI'.split('').map(type => createPiece(type));

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case 'J':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1],
            ];
        case 'L':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0],
            ];
        case 'O':
            return [
                [1, 1],
                [1, 1],
            ];
        case 'S':
            return [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ];
        case 'Z':
            return [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ];
        case 'I':
            return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Función para actualizar el estado del juego
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Función para mover la pieza hacia abajo
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        resetPlayer();
        arenaSweep();
    }
    dropCounter = 0;
}

// Función para mover la pieza lateralmente
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Configuración del jugador
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: null
};

// Función para restablecer la posición del jugador
function resetPlayer() {
    const pieces = 'TJLOSZI';
    const pieceType = pieces[(pieces.length * Math.random()) | 0];
    player.matrix = createPiece(pieceType);
    player.color = colors[pieces.indexOf(pieceType) + 1];
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over");
        resetGame();
    }
}

// Detectar colisiones
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                 arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Fusión de piezas en la arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = colors.indexOf(player.color);
            }
        });
    });
}

// Barrido de la arena para eliminar filas completas
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        // Aquí podrías incrementar la puntuación, por ejemplo.
        score += rowCount * 10;
        rowCount *= 2;
        scoreElement.innerText = score;
    }
}

// Crear la arena
function createArena(w, h) {
    const arena = [];
    while (h--) {
        arena.push(new Array(w).fill(0));
    }
    return arena;
}

const arena = createArena(COLUMNS, ROWS);

// Función para dibujar el tablero y la pieza actual
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-0.2);
    } else if (event.keyCode === 39) {
        playerMove(0.2);
    } else if (event.keyCode === 40) {
        playerDrop();
    }
});

// Inicializa el juego
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    resetGame();
    update();
});

// Función para rotar la pieza
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Detectar colisiones al rotar
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Añadir evento de tecla para rotar
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

// Función para restablecer el juego
function resetGame() {
    score = 0;
    scoreElement.innerText = score;
    arena.forEach(row => row.fill(0));
    resetPlayer();
}