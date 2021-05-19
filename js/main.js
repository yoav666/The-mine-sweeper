'use strict'
// console.log('namaste')
const MINE = '💣';
const FLAG = '🏴‍☠️';
const EMPTY = '';
const LIFE = '💙'

var gIntervalTime = null
var milsecounds = 0;
var secounds = 0;
var minutes = 0;
var gBoard;
var gIsVictory = false
var gIsGameOver = false;
var gLevel = {
    SIZE: 8,
    MINES: 12,
    LIVES: 3
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};


function initGame() {
    clearInterval(gIntervalTime)
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gIsGameOver = false
    gIsVictory = false
    closeModal()
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLives()
    milsecounds = 0;
    secounds = 0;
    minutes = 0;

}

function restartGame(size) {
    gLevel.SIZE = size
    if (size === 4) {
        gLevel.MINES = 2
        gLevel.LIVES = 1
    } else if (size === 12) {
        gLevel.MINES = 30
        gLevel.LIVES = 3
    } else {
        gLevel.MINES = 12
        gLevel.LIVES = 3
    }
    initGame()
}
function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}
function setMinesRandom(locationI, locationJ, board) {
    var emptyLocations = getAllEmptyLocations(locationI, locationJ, board)
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyLocation = emptyLocations[getRandomIntInclusive(0, emptyLocations.length - 1)]
        // console.log(emptyLocation)
        board[emptyLocation.i][emptyLocation.j].isMine = true
        board[emptyLocation.i][emptyLocation.j].minesAroundCount = 'mine'
        var emptyIndex = emptyLocations.indexOf(emptyLocation)
        emptyLocations.splice(emptyIndex, 1)

    }
    // console.log(board)
}

function getAllEmptyLocations(locationI, locationJ, board) {
    var emptyLocations = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === locationI && j === locationJ) continue
            var cell = board[i][j]
            var cellLocation = { i, j }
            if (!cell.isMine && !cell.isShown) {
                emptyLocations.push(cellLocation)
            }
        }
    }
    // console.log(emptyLocations)
    return emptyLocations
}
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine) continue
            cell.minesAroundCount = minesNegsCount(i, j, board)
        }
    }
}
function minesNegsCount(cellI, cellJ, board) {
    var mineCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === cellI && j === cellJ) continue
            var cell = board[i][j];
            if (cell.isMine) mineCount++
            // console.log(mineCount)
        }
    }
    return mineCount
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var className = `cell-${i}-${j}`
            if (cell.isMarked) {
                cell = FLAG
                className += ' flag'
            } else if (cell.isShown) {
                if (cell.isMine) {
                    cell = MINE
                    className += ' bomb'
                } else {
                    if (cell.minesAroundCount === 0) {
                        cell = EMPTY
                        className += ' touch'
                    } else {
                        cell = cell.minesAroundCount
                        className += ' touch'
                    }
                }
            }
            else {
                cell = EMPTY
            }
            strHTML += `<td class="cell ${className}" 
        onclick="cellClicked(${i},${j},this)" 
        oncontextmenu="cellMarked(this,${i},${j})">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}
function firstmove(i, j, board) {
    gIntervalTime = setInterval(stopwatch, 10)
    gGame.isOn = true
    var cell = gBoard[i][j]
    cell.isShown = true
    gGame.shownCount++
    setMinesRandom(i, j, board)
    setMinesNegsCount(gBoard)
    if (cell.minesAroundCount === 0) {
        expandShown(i, j, gBoard)
    }
    renderBoard(board)
}
function cellClicked(i, j, elCell) {
    if (!gGame.isOn) {
        firstmove(i, j, gBoard)
    }
    if (gIsGameOver) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) return
    if (cell.minesAroundCount === 0) {
        expandShown(i, j, gBoard)
    } else if (cell.isMine) {
        cell.isShown = true
        gGame.shownCount++
        elCell.innerText = MINE
        elCell.classList.add('bomb')
        gLevel.LIVES--
        // console.log(gLevel.LIVES)
        renderLives()
        checkGameOver()
    } else {
        if (cell.minesAroundCount === 0) {
            if (cell.isShown) return
            cell.isShown = true
            gGame.shownCount++
            elCell.innerText = EMPTY
            elCell.classList.add('touch')
        } else {
            if (cell.isShown) return
            cell.isShown = true
            gGame.shownCount++
            elCell.innerText = cell.minesAroundCount
            elCell.classList.add('touch')
        }
    }
    checkVictory()
}

document.oncontextmenu = rightClick;
function rightClick(clickEvent) {
    clickEvent.preventDefault();
    return false;
}
function cellMarked(elCell, i, j) {
    if (gIsGameOver) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (!cell.isMarked) {
        cell.isMarked = true
        elCell.innerText = FLAG
        elCell.classList.add('flag')
        gGame.markedCount++
    } else {
        cell.isMarked = false
        elCell.innerText = EMPTY
        elCell.classList.remove('flag')
        gGame.markedCount--
    }
    checkVictory()

}
function checkVictory() {
    var totalSize = gLevel.SIZE ** 2
    // console.log(gGame.shownCount)
    // console.log(gGame.markedCount)
    if (gGame.markedCount > gLevel.MINES) return
    if ((gGame.shownCount) + (gGame.markedCount) === totalSize) {
        clearInterval(gIntervalTime)
        console.log('victory')
        gIsVictory = true
        openModal(gIsVictory)
    }
}

function checkGameOver() {
    // console.log(gLevel.LIVES)
    if (gLevel.LIVES === 0) {
        console.log('gameover')
        gIsGameOver = true
        openModal(gIsGameOver)
        gameOver()

    }
}
function openModal(value) {
    var elModal = document.querySelector('.modal')
    elModal.innerText = (value === gIsVictory) ? 'Victory' : 'Game-Over'
    var elModalOut = document.querySelector('.modal-out')
    elModalOut.style.display = 'flex'
}
function closeModal(){
    var elModalOut = document.querySelector('.modal-out')
    elModalOut.style.display = 'none'

}
function gameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                cell.isShown = true
                renderCell({ i, j }, MINE)
            }
        }
    }
    clearInterval(gIntervalTime)
}
function expandShown(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === cellI && j === cellJ) continue
            var cell = board[i][j]
            if (!cell.isShown) {
                if (cell.minesAroundCount === 0) {
                    if (cell.isMarked) continue
                    cell.isShown = true
                    gGame.shownCount++
                    renderCell({ i: i, j: j }, EMPTY)
                    expandShown(i, j, gBoard)
                } else {
                    if (cell.isMarked) continue
                    cell.isShown = true
                    gGame.shownCount++
                    renderCell({ i, j }, cell.minesAroundCount)
                }
            }
        }
    }
}
function renderLives() {
    var elLife = document.querySelector('.lives span')
    elLife.innerHTML = ''
    for (var i = 0; i < gLevel.LIVES; i++) {
        elLife.innerHTML += LIFE
    }
}
function stopwatch() {
    milsecounds++
    if (milsecounds / 100 === 1) {
        milsecounds = 0;
        secounds++;
    }
    if (secounds / 60 === 1) {
        secounds = 0;
        minutes++;
    }
    var displayMilsecounds = (milsecounds < 10) ? '0' + milsecounds.toString() : milsecounds;
    var displaySecounds = (secounds < 10) ? '0' + secounds.toString() : secounds;
    var displayMinutes = (minutes < 10) ? '0' + minutes.toString() : minutes;
    document.querySelector('.timing').innerText = displayMinutes + ":" + displaySecounds + ":" + displayMilsecounds;
}





// function createMat(ROWS, COLS) {
//     var mat = []
//     for (var i = 0; i < ROWS; i++) {
//         var row = []
//         for (var j = 0; j < COLS; j++) {
//             row.push('')
//         }
//         mat.push(row)
//     }
//     return mat
// }
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    if (gIsGameOver) {
        if (elCell.classList.contains('touch')) {
            elCell.classList.remove('touch')
        } else {
            elCell.classList.remove('flag')
        }
        elCell.classList.add('bomb')
    }
    elCell.classList.add('touch')
    elCell.innerHTML = value;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}