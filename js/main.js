'use strict'
const MINE = '💣';
const FLAG = '🏴‍☠️';
const EMPTY = '';
const LIFE = '💙'
const BAD = '🤯'
const NORMAL = '🙂'
const GOOD = '😎'
const GAMEOVER = '🤬'
const HINT = '🔎'
const HINTISON = '💡'
const SAFECLICK = '✔'

document.oncontextmenu = rightClick;///need to make it better
// var gisMarkedGoodOrBad = false
var gBestTime4 = Infinity;
var gSumTime = 0
var gSumTime2 = '';

var milsecounds = 0;
var secounds = 0;
var minutes = 0;

var gIntervalTime = null
var gIntervalSafeClick = null

var gBoard;
var gIsHintOn = false
var gIsVictory = false
var gIsGameOver = false;
var gLevel = {
    SIZE: 8,
    MINES: 12,
    LIVES: 3,
    HINTS: 3,
    SAFECLICKS: 3
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};


function initGame() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = NORMAL
    clearInterval(gIntervalTime)
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gIsHintOn = false
    gIsGameOver = false
    gIsVictory = false
    closeModal()
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLives()
    renderHints()
    renderSafeClicks()
    milsecounds = 0;
    secounds = 0;
    minutes = 0;

}

function restartGame(size) {
    gLevel.SIZE = size
    if (size === 4) {
        gLevel.MINES = 2
        gLevel.LIVES = 1//1
        gLevel.HINTS = 1//1
        gLevel.SAFECLICKS = 1//1
    } else if (size === 12) {
        gLevel.MINES = 30
        gLevel.LIVES = 3
        gLevel.HINTS = 3
        gLevel.SAFECLICKS = 3
    } else {
        gLevel.MINES = 12
        gLevel.LIVES = 3
        gLevel.HINTS = 3
        gLevel.SAFECLICKS = 3
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
        board[emptyLocation.i][emptyLocation.j].isMine = true
        board[emptyLocation.i][emptyLocation.j].minesAroundCount = 'mine'
        var emptyIndex = emptyLocations.indexOf(emptyLocation)
        emptyLocations.splice(emptyIndex, 1)

    }
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
        }
    }
    return mineCount
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            // var cell = board[i][j]
            var className = `cell-${i}-${j}`
            // if (cell.isMarked) {
            //     cell = FLAG
            //     className += ' flag'
            // } else if (cell.isShown) {
            //     if (cell.isMine) {
            //         cell = MINE
            //         className += ' bomb'
            //     } else {
            //         if (cell.minesAroundCount === 0) {
            //             cell = EMPTY
            //             className += ' touch'
            //         } else {
            //             cell = cell.minesAroundCount
            //             className += ' touch'
            //         }
            //     }
            // }
            // else {
            // cell = EMPTY
            // }
            strHTML += `<td class="cell ${className}" 
        onclick="cellClicked(${i},${j},this)" 
        oncontextmenu="cellMarked(this,${i},${j})"></td>`//${cell}
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
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    if (cell.minesAroundCount === 0) {
        elCell.innerText = EMPTY
        elCell.classList.add('touch')
        expandShown(i, j, gBoard)
    } else {
        elCell.innerText = cell.minesAroundCount
        elCell.classList.add('touch')
    }
}
function cellClicked(i, j, elCell) {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = NORMAL
    if (!gGame.isOn) {
        firstmove(i, j, gBoard)
        return
    }
    if (gIsHintOn && gLevel.HINTS > 0) {
        getHint(i, j, gBoard)
        gLevel.HINTS--
        renderHints()
        return
    }
    if (gIsGameOver) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) return
    if (cell.minesAroundCount === 0) {
        cell.isShown = true
        gGame.shownCount++
        elCell.innerText = EMPTY
        elCell.classList.add('touch')
        expandShown(i, j, gBoard)
    } else if (cell.isMine) {
        cell.isShown = true
        gGame.shownCount++
        elCell.innerText = MINE
        elCell.classList.add('bomb')
        gLevel.LIVES--
        renderLives()
        elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = BAD
        checkGameOver()
    } else if (cell.minesAroundCount > 0) {
        cell.isShown = true
        gGame.shownCount++
        elCell.innerText = cell.minesAroundCount
        elCell.classList.add('touch')
    }
    checkVictory()
}

function rightClick(clickEvent) {
    clickEvent.preventDefault();
    return false;
}
function cellMarked(elCell, i, j) {
    if (gIsVictory) return
    if (gIsGameOver) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMine && !cell.isMarked) {
        cell.isMarked = true
        elCell.innerText = FLAG
        elCell.classList.add('flag')
        gGame.markedCount++
    } else if (!cell.isMine && !cell.isMarked) { //need to fix this problem if two or one is not mark as should
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
    if (gIsGameOver) return
    var totalSize = gLevel.SIZE ** 2
    if (gGame.markedCount > gLevel.MINES) return
    if ((gGame.shownCount) + (gGame.markedCount) === totalSize) {
        gIsVictory = true
        checkBestTime()
        clearInterval(gIntervalTime)
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = GOOD
        openModal(gIsVictory)
    }
}

function checkBestTime() {//need to make it on board.+display it..sec/100 min/60*100...
    // localStorage.clear()

    if (gLevel.SIZE === 4) {
        var bestTimePrv = parseInt(localStorage.getItem(`bestTime-level-4`))
    } else if (gLevel.SIZE === 8) {
        bestTimePrv = parseInt(localStorage.getItem(`bestTime-level-8`))
    } else if (gLevel.SIZE === 12) {
        bestTimePrv = parseInt(localStorage.getItem(`bestTime-level-12`))
    }

    if (!bestTimePrv) {
        bestTimePrv = Infinity
    }
    var timeThisGame = gSumTime

    if (timeThisGame < bestTimePrv) {
        gBestTime4 = timeThisGame
    }
    if (gLevel.SIZE === 4) {
        localStorage.setItem('bestTime-level-4', gBestTime4)
        console.log(gBestTime4)
        renderBestTimes()
    } else if (gLevel.SIZE === 8) {
        localStorage.setItem('bestTime-level-8', gBestTime)
    } else if (gLevel.SIZE === 12) {
        localStorage.setItem('bestTime-level-12', gBestTime)
    }
}
function renderBestTimes() {
    var str = ''
    if (gLevel.SIZE === 4) {

        var time = localStorage.getItem('bestTime-level-4')
        // console.log(time.length)
        var milsecounds = parseInt(time) % 100
        // console.log(milsecounds)
        if (time.length === 3) {
            time = time / 100
            var secounds = parseInt(time) % 10
        } else if (time.length === 4) {
            time = time / 100
            secounds = parseInt(time) % 100
            // console.log(secounds)
        }
        var displayMilsecounds = (milsecounds < 10) ? '0' + milsecounds.toString() : milsecounds;
        var displaySecounds = (secounds < 10) ? '0' + secounds.toString() : secounds;
        str = `${displaySecounds}:${displayMilsecounds}`
        // console.log(str)
        var elBestTimeLvl4 = document.querySelector('.best-time-level-4 span');
        elBestTimeLvl4.innerText = str
    }
}
function checkGameOver() {
    if (gLevel.LIVES === 0) {
        // console.log('gameover')
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j]
                if (cell.isMine) {
                    cell.isShown = true
                    var elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.innerText = MINE
                    if (elCell.classList.contains('flag')) {
                        elCell.classList.remove('flag')
                    }
                    elCell.classList.add('bomb')
                }
            }
        }
        gIsGameOver = true
        openModal(gIsGameOver)
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = GAMEOVER
        clearInterval(gIntervalTime)

    }
}
function openModal(value) {
    var elModal = document.querySelector('.modal')
    elModal.innerText = (value === gIsVictory) ? 'Victory' : 'Game-Over'
    var elModalOut = document.querySelector('.modal-out')
    elModalOut.style.display = 'flex'
}
function closeModal() {
    var elModalOut = document.querySelector('.modal-out')
    elModalOut.style.display = 'none'
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
                    var elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.classList.add('touch')
                    elCell.innerText = EMPTY
                    expandShown(i, j, gBoard)
                } else {
                    if (cell.isMarked) continue
                    cell.isShown = true
                    gGame.shownCount++
                    elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.classList.add('touch')
                    elCell.innerText = cell.minesAroundCount
                }
            }
        }
    }
}
function renderHints() {
    var elHint = document.querySelector('.hints span')
    elHint.innerText = ''
    for (var i = 0; i < gLevel.HINTS; i++) {
        elHint.innerText += HINT
    }
}
function hintClicked() {
    if (gLevel.HINTS > 0 && gGame.isOn && !gIsGameOver && !gIsVictory) {
        var elHintOn = document.querySelector('.hints span')
        elHintOn.innerText = HINTISON
        gIsHintOn = true
    } else {
        console.log('game is not playing or u dont have hints anymore')
        return
    }
}
function getHint(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            var cell = board[i][j]
            if (!cell.isShown && !cell.isMarked) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                if (cell.isMine) {
                    elCell.innerText = MINE
                    elCell.classList.add('hintCells')
                } else {
                    elCell.innerText = cell.minesAroundCount
                    elCell.classList.add('hintCells')
                }
                clearHint()
            }
        }
    }
}
function clearHint() {
    setTimeout(function () {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j]
                if (!cell.isShown && !cell.isMarked) {
                    var elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.innerText = EMPTY
                    if (elCell.classList.contains('hintCells')) {
                        elCell.classList.remove('hintCells')
                    }
                }
            }
        }
    }, 600);
    gIsHintOn = false
}
function renderSafeClicks() {
    var elSafeClick = document.querySelector('.safe-click span')
    elSafeClick.innerText = ''
    for (var i = 0; i < gLevel.SAFECLICKS; i++) {
        elSafeClick.innerText += SAFECLICK
    }

}
function getSafeClicks() {
    var safeClickLocations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var cellLocation = { i, j }
            if (!cell.isMarked && !cell.isMine && !cell.isShown)
                safeClickLocations.push(cellLocation)
        }
    }
    // console.log(safeClickLocations)
    return safeClickLocations
}
function safeClickClicked() {
    if (gLevel.SAFECLICKS === 0) return
    var safeClickLocations = getSafeClicks()
    var safeClickLocation = safeClickLocations[getRandomIntInclusive(0, safeClickLocations.length - 1)]
    var i = safeClickLocation.i
    var j = safeClickLocation.j
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    gIntervalSafeClick = setInterval(function () {
        elCell.classList.add('safe-click-color')
        setTimeout(function () {
            elCell.classList.remove('safe-click-color')
        }, 300);
    }, 600);
    gLevel.SAFECLICKS--
    renderSafeClicks()
    clearSafeClick()
}
function clearSafeClick() {
    setTimeout(function () {
        clearInterval(gIntervalSafeClick)
        gIntervalSafeClick = null
    }, 2500);
}
function renderLives() {
    var elLife = document.querySelector('.lives span')
    elLife.innerText = ''
    for (var i = 0; i < gLevel.LIVES; i++) {
        elLife.innerText += LIFE
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
    gSumTime = minutes * 60 * 100 + secounds * 100 + milsecounds
    gSumTime2 = displayMinutes + ':' + displaySecounds + ':' + displayMilsecounds;
    var elTime = document.querySelector('.timer')
    elTime.innerText = displayMinutes + ":" + displaySecounds + ":" + displayMilsecounds;

}




//------custom menu----///
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


///-----undo----///
// function undo(){
//     var undo=[]
// }
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}



// function renderCell(location, value) {
//     var cellSelector = '.' + getClassName(location)
//     var elCell = document.querySelector(cellSelector);
//     // if (gIsGameOver) {
//     //     if (elCell.classList.contains('touch')) {
//     //         elCell.classList.remove('touch')
//     //     } else {
//     //         elCell.classList.remove('flag')
//     //     }
//     //     elCell.classList.add('bomb')
//     // }
//     // elCell.classList.add('touch')
//     elCell.innerHTML = value;
// }

// function getClassName(location) {
//     var cellClass = 'cell-' + location.i + '-' + location.j;
//     return cellClass;
// }