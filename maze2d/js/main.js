const gridSize = 20
const wallColor = "dddddd"
const roadColor = "ffffff"
const playerToken = "😀"
const worldData = new MazeBuilder(20, 15);
const width = worldData.cols;
const height = worldData.rows;

var position = [0, 0]

window.onload = function () {
    const myHeading = document.querySelector('h1')
    myHeading.textContent = 'MAZE'
    initKeys()
    resetPlayerPosition()
    drawWorld()
}

function initKeys() {
    document.addEventListener('keydown', ({code}) => {
        switch (code) {
            case "KeyW":
            case "ArrowUp":
                tryMovePosition(0, -1);
                break;

            case "KeyA":
            case "ArrowLeft":
                tryMovePosition(-1, 0);
                break;

            case "KeyS":
            case "ArrowDown":
                tryMovePosition(0, +1);
                break;

            case "KeyD":
            case "ArrowRight":
                tryMovePosition(1, 0);
                break;
        }
        drawWorld()
        if (isExit())
        {
            alert('DONE!')
        }
    })
}

function tryMovePosition(x, y) {
    if (!checkIsValidPosition(x, y))
        return;
    movePlayer(x, y)
}

function movePlayer(x, y) {
    position[0] += x
    position[1] += y
}

function checkIsValidPosition(x, y) {
    const expectedX = position[0] + x
    const expectedY = position[1] + y
    if (expectedX < 0 || expectedX >= width)
        return false;
    if (expectedY < 0 || expectedY >= height)
        return false;

    const expectedSpace = worldData.maze[expectedY][expectedX];
    if (expectedSpace == "wall")
        return false

    return true
}

function drawWorld() {
    var worldTable = '<table class="world" cellspacing="0" cellpadding="0">';
    for (var y = 0; y < height; y++) {
        worldTable += '<tr>'
        for (var x = 0; x <width ; x++) {
            const isWall = worldData.maze[y][x].includes('wall')
            const color = isWall ? wallColor : roadColor
            const inner = (position[0] === x && position[1] === y) ? playerToken : ''
            worldTable += `<td style="height:${gridSize}px;width:${gridSize}px;background-color:#${color};font-size:12px">${inner}</td>`
        }
        worldTable += '</tr>'
    }
    worldTable += '</table>'
    const world = document.getElementById("world")
    world.innerHTML = worldTable
}

function resetPlayerPosition() {
    for (var y = 0; y <height; y++) {
        for (var x = 0; x < width; x++) {
            const isEntrance = worldData.maze[y][x].includes('entrance')
            if (isEntrance) {
                position = [x, y]
                break
            }
        }
    }
}

function isExit()
{
    const [x, y] = position
    return worldData.maze[y][x].includes('exit')
}
