'use strict'
const MINE = '💣';
const FLAG = '🏴‍☠️';
const EMPTY = '';
const LIFE = '💙';
const BAD = '🤯';
const NORMAL = '🙂';
const GOOD = '😎';
const GAMEOVER = '🤬';
const HINT = '🔎';
const HINTISON = '💡';
const SAFECLICK = '✔';

document.oncontextmenu = rightClick;
var gMoves = [];
var gSumTime = 0;
var milsecounds = 0;
var secounds = 0;
var minutes = 0;
var gCountMinesManual = 0;
var gIntervalTime = null;
var gIntervalSafeClick = null;
var gBoard;
var gIsManual = false;
var gIsHintOn = false;
var gIsVictory = false;
var gIsGameOver = false;
var gLevel = {
    SIZE: { ROWS: 8, COLS: 8 },
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
firstBestTimeRender();
function firstBestTimeRender() {
    gLevel.SIZE.ROWS = 4;
    gLevel.SIZE.COLS = 4;
    renderBestTimes();
    gLevel.SIZE.ROWS = 8;
    gLevel.SIZE.COLS = 8;
    renderBestTimes();
    gLevel.SIZE.ROWS = 12;
    gLevel.SIZE.COLS = 12;
    renderBestTimes();
    gLevel.SIZE.ROWS = 8;
    gLevel.SIZE.COLS = 8;
}
function initGame() {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = NORMAL;
    clearInterval(gIntervalTime);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gIsHintOn = false;
    gIsGameOver = false;
    gIsVictory = false;
    closeModal();
    gBoard = buildBoard();
    renderBoard(gBoard);
    renderLives();
    renderHints();
    renderSafeClicks();
    milsecounds = 0;
    secounds = 0;
    minutes = 0;

}
function restartGame(sizeRows, sizeCols) {
    var elMinesManualMsgOut = document.querySelector('.manual-msg-out');
    var elMinesManualMsg = document.querySelector('.manual-msg');
    gLevel.SIZE.ROWS = sizeRows;
    gLevel.SIZE.COLS = sizeCols;
    if (sizeRows === 4 && sizeCols === 4) {
        elMinesManualMsgOut.style.display = 'none';
        gLevel.MINES = 2;
        gLevel.LIVES = 1;
        gLevel.HINTS = 1;
        gLevel.SAFECLICKS = 1;
    } else if (sizeRows === 12 && sizeCols === 12) {
        elMinesManualMsgOut.style.display = 'none';
        gLevel.MINES = 30;
        gLevel.LIVES = 3;
        gLevel.HINTS = 3;
        gLevel.SAFECLICKS = 3;
    } else if (sizeRows === 8 && sizeCols === 8) {
        elMinesManualMsgOut.style.display = 'none';
        gLevel.MINES = 12;
        gLevel.LIVES = 3;
        gLevel.HINTS = 3;
        gLevel.SAFECLICKS = 3;
    } else if (sizeRows === -1 && sizeCols === -1) {
        gLevel.SIZE.ROWS = +prompt('How many rows?');
        gLevel.SIZE.COLS = +prompt('How many cols?');
        gLevel.MINES = +prompt('How many mines ?');
        gLevel.LIVES = 3;
        gLevel.HINTS = 3;
        gLevel.SAFECLICKS = 3;
        gCountMinesManual = gLevel.MINES;
        gIsManual = true;
        minutes = 0;
        secounds = 0;
        milsecounds = 0;
        elMinesManualMsgOut.style.display = 'flex';
        elMinesManualMsg.innerText = 'PLACE THE MINES';
    } else {
        elMinesManualMsgOut.style.display = 'flex';
        elMinesManualMsg.innerText = 'NOW IS RANDOM';
        gLevel.LIVES = 3;
        gLevel.HINTS = 3;
        gLevel.SAFECLICKS = 3;
    }
    initGame();
}
function placeMines(i, j, elCell) {
    var cell = gBoard[i][j];
    if (cell.isMine) return;
    cell.isMine = true;
    elCell.innerText = MINE;
    elCell.classList.add('bomb');
    setTimeout(function () {
        elCell.innerText = EMPTY;
        elCell.classList.remove('bomb');
    }, 300)
    gCountMinesManual--;
    gIsManual = true;
    if (gCountMinesManual === 0) {
        gIsManual = false;
        gGame.isOn = true;
        setMinesNegsCount(gBoard);
    }
}
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE.ROWS; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE.COLS; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}
function setMinesRandom(locationI, locationJ, board) {
    var emptyLocations = getAllEmptyLocations(locationI, locationJ, board);
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyLocation = emptyLocations[getRandomIntInclusive(0, emptyLocations.length - 1)];
        board[emptyLocation.i][emptyLocation.j].isMine = true;
        board[emptyLocation.i][emptyLocation.j].minesAroundCount = 'mine';
        var emptyIndex = emptyLocations.indexOf(emptyLocation);
        emptyLocations.splice(emptyIndex, 1);

    }
}
function getAllEmptyLocations(locationI, locationJ, board) {
    var emptyLocations = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === locationI && j === locationJ) continue;
            var cell = board[i][j];
            var cellLocation = { i, j };
            if (!cell.isMine && !cell.isShown) {
                emptyLocations.push(cellLocation);
            }
        }
    }
    return emptyLocations;
}
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;
            cell.minesAroundCount = minesNegsCount(i, j, board);
        }
    }
}
function minesNegsCount(cellI, cellJ, board) {
    var mineCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === cellI && j === cellJ) continue;
            var cell = board[i][j];
            if (cell.isMine) mineCount++;
        }
    }
    return mineCount;
}
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell-${i}-${j}`;
            strHTML += `<td class="cell ${className}" 
        onclick="cellClicked(${i},${j},this)" 
        oncontextmenu="cellMarked(this,${i},${j})"></td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
function firstmove(i, j, board) {
    gIntervalTime = setInterval(stopwatch, 10);
    gGame.isOn = true;
    var cell = gBoard[i][j];
    cell.isShown = true;
    gGame.shownCount++;
    setMinesRandom(i, j, board);
    setMinesNegsCount(gBoard);
    var cellPos = { i, j }
    gMoves.push(cellPos)
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    if (cell.minesAroundCount === 0) {
        elCell.innerText = EMPTY;
        elCell.classList.add('touched');
        expandShown(i, j, gBoard);
    } else {
        elCell.innerText = cell.minesAroundCount;
        elCell.classList.add('touched');
    }
}
function cellClicked(i, j, elCell) {
    if (gIsGameOver || gIsVictory) return;
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = NORMAL;
    if (!gGame.isOn && !gIsManual) {
        firstmove(i, j, gBoard);
        return
    }
    if (gIsManual) {
        placeMines(i, j, elCell);
        if (gCountMinesManual === 0) {
            gIntervalTime = setInterval(stopwatch, 10);
            var elMinesManualMsgOut = document.querySelector('.manual-msg-out');
            elMinesManualMsgOut.style.display = 'none';
        }
        return;
    }
    if (gIsHintOn && gLevel.HINTS > 0) {
        getHint(i, j, gBoard);
        gLevel.HINTS--;
        renderHints();
        return;
    }
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (cell.isMarked) return;
    if (cell.minesAroundCount === 0) {
        cell.isShown = true;
        gGame.shownCount++;
        var cellPos = { i, j }
        gMoves.push(cellPos)
        elCell.innerText = EMPTY;
        elCell.classList.add('touched');
        expandShown(i, j, gBoard);
    } else if (cell.isMine) {
        cell.isShown = true;
        gGame.shownCount++;
        cellPos = { i, j }
        gMoves.push(cellPos)
        elCell.innerText = MINE;
        elCell.classList.add('bomb');
        gLevel.LIVES--;
        renderLives();
        elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = BAD;
        checkGameOver();
    } else if (cell.minesAroundCount > 0) {
        cell.isShown = true;
        gGame.shownCount++;
        cellPos = { i, j }
        gMoves.push(cellPos)
        elCell.innerText = cell.minesAroundCount;
        elCell.classList.add('touched');
    }
    checkVictory();
}
function rightClick(clickEvent) {
    clickEvent.preventDefault();
    return false;
}
function cellMarked(elCell, i, j) {
    if (gIsVictory) return;
    if (gIsGameOver) return;
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (cell.isMine && !cell.isMarked) {
        cell.isMarked = true;
        elCell.innerText = FLAG;
        var cellPos = { i, j }
        gMoves.push(cellPos)
        elCell.classList.add('flag');
        gGame.markedCount++;
    } else if (!cell.isMine && !cell.isMarked) {
        cell.isMarked = true;
        elCell.innerText = FLAG;
        cellPos = { i, j }
        gMoves.push(cellPos)
        elCell.classList.add('flag');
        gGame.markedCount++;
    } else {
        cell.isMarked = false;
        elCell.innerText = EMPTY;
        // cellPos={i,j}
        // gMoves.push(cellPos)//maybe need?
        elCell.classList.remove('flag');
        gGame.markedCount--;
    }
    checkVictory();
}
function checkVictory() {
    if (gIsGameOver) return;
    var totalSize = gLevel.SIZE.ROWS * gLevel.SIZE.COLS;
    if (gGame.markedCount > gLevel.MINES) return;
    if ((gGame.shownCount) + (gGame.markedCount) === totalSize) {
        gIsVictory = true;
        checkBestTime();
        clearInterval(gIntervalTime);
        var elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = GOOD;
        openModal(gIsVictory);
    }
}
function checkBestTime() {
    if (gLevel.SIZE.ROWS === 4 && gLevel.SIZE.COLS === 4) {
        var bestTime4 = parseInt(localStorage.getItem(`bestTime-level-4`));
        if (!bestTime4) {
            bestTime4 = Infinity;
        }
        var timeThisGame4 = gSumTime;
        if (timeThisGame4 < bestTime4) {
            bestTime4 = timeThisGame4;
        }
        localStorage.setItem('bestTime-level-4', bestTime4);
        renderBestTimes();
    } else if (gLevel.SIZE.ROWS === 8 && gLevel.SIZE.COLS === 8) {
        var bestTime8 = parseInt(localStorage.getItem(`bestTime-level-8`));
        if (!bestTime8) {
            bestTime8 = Infinity;
        }
        var timeThisGame8 = gSumTime;
        if (timeThisGame8 < bestTime8) {
            bestTime8 = timeThisGame8;
        }
        localStorage.setItem('bestTime-level-8', bestTime8);
        renderBestTimes();
    } else if (gLevel.SIZE.ROWS === 12 && gLevel.SIZE.COLS === 12) {
        var bestTime12 = parseInt(localStorage.getItem(`bestTime-level-12`));
        if (!bestTime12) {
            bestTime12 = Infinity;
        }
        var timeThisGame12 = gSumTime;
        if (timeThisGame12 < bestTime12) {
            bestTime12 = timeThisGame12;
        }
        localStorage.setItem('bestTime-level-12', bestTime12);
        renderBestTimes();
    }
}
function renderBestTimes() {
    var str = '';
    if (gLevel.SIZE.ROWS === 4 && gLevel.SIZE.COLS === 4) {
        var time = localStorage.getItem('bestTime-level-4');
    } else if (gLevel.SIZE.ROWS === 8 && gLevel.SIZE.COLS === 8) {
        time = localStorage.getItem('bestTime-level-8');
    } else if (gLevel.SIZE.ROWS === 12 && gLevel.SIZE.COLS === 12) {
        time = localStorage.getItem('bestTime-level-12');
    }
    time = parseInt(time);
    var milsecounds = parseInt(time) % 100;
    if (time >= 7000) {
        var time2 = time;
        time2 = time2 / 100;
        time2 = time2 / 60;
        var minutes = parseInt(time2) % 10;
        var secounds = parseInt(((time - (minutes * 60 * 100))) / 100) % 100;
    } else if (time >= 6000) {
        var time2 = time;
        time2 = time2 / 100;
        time2 = time2 / 60;
        var minutes = parseInt(time2) % 10;
        var secounds = parseInt(((time - (minutes * 60 * 100))) / 100) % 10;
    } else if (time >= 1000) {
        time = time / 100;
        secounds = parseInt(time) % 100;
    } else if (time >= 100) {
        time = time / 100;
        secounds = parseInt(time) % 10;
    }

    var displayMilsecounds = (milsecounds < 10) ? '0' + milsecounds.toString() : milsecounds;
    var displaySecounds = (secounds < 10) ? '0' + secounds.toString() : secounds;
    var displayMinutes = (minutes < 10) ? '0' + minutes.toString() : minutes;
    if (!secounds && !minutes) {
        str = `${displayMilsecounds}`;
    } else if (!minutes) {
        str = `${displaySecounds}:${displayMilsecounds}`;
    } else {
        str = `${displayMinutes}:${displaySecounds}:${displayMilsecounds}`;
    }
    if (gLevel.SIZE.ROWS === 4 && gLevel.SIZE.COLS === 4) {
        var elBestTimeLvl4 = document.querySelector('.lvl-4 span');
        elBestTimeLvl4.innerText = ' ' + str;
    } else if (gLevel.SIZE.ROWS === 8 && gLevel.SIZE.COLS === 8) {
        var elBestTimeLvl8 = document.querySelector('.lvl-8 span');
        elBestTimeLvl8.innerText = ' ' + str;
    } else if (gLevel.SIZE.ROWS === 12 && gLevel.SIZE.COLS === 12) {
        var elBestTimeLvl12 = document.querySelector('.lvl-12 span');
        elBestTimeLvl12.innerText = ' ' + str;
    }
}
function checkGameOver() {
    if (gLevel.LIVES === 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j];
                if (cell.isMine) {
                    cell.isShown = true;
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.innerText = MINE;
                    if (elCell.classList.contains('flag')) {
                        elCell.classList.remove('flag');
                    }
                    elCell.classList.add('bomb');
                }
            }
        }
        gIsGameOver = true;
        openModal(gIsGameOver);
        var elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = GAMEOVER;
        clearInterval(gIntervalTime);

    }
}
function openModal(value) {
    var elModal = document.querySelector('.modal');
    elModal.innerText = (value === gIsVictory) ? 'Victory' : 'Game-Over';
    var elModalOut = document.querySelector('.modal-out');
    elModalOut.style.display = 'flex';
}
function closeModal() {
    var elModalOut = document.querySelector('.modal-out');
    elModalOut.style.display = 'none';
}
function expandShown(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            var cell = board[i][j];
            if (!cell.isShown) {
                if (cell.minesAroundCount === 0) {
                    if (cell.isMarked) continue;
                    cell.isShown = true;
                    gGame.shownCount++;
                    var cellPos = { i, j }
                    gMoves.push(cellPos)
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.classList.add('touched');
                    elCell.innerText = EMPTY;
                    expandShown(i, j, gBoard);
                } else {
                    if (cell.isMarked) continue;
                    cell.isShown = true;
                    gGame.shownCount++;
                    cellPos = { i, j }
                    gMoves.push(cellPos)
                    elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.classList.add('touched');
                    elCell.innerText = cell.minesAroundCount;
                }
            }
        }
    }
}
function renderHints() {
    var hintStrHTML = '';
    var value = '';
    var elHint = document.querySelector('.hints-inside');
    elHint.innerHTML = hintStrHTML;
    for (var i = 0; i < gLevel.HINTS; i++) {
        value = HINT;
        hintStrHTML = `<div onclick="hintClicked(this)">${value}</div>`;
        elHint.innerHTML += hintStrHTML;
    }
}
function hintClicked(elHintOn) {
    if (gLevel.HINTS > 0 && gGame.isOn && !gIsGameOver && !gIsVictory) {
        elHintOn.innerText = HINTISON;
        gIsHintOn = true;
    }
}
function getHint(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            var cell = board[i][j];
            if (!cell.isShown && !cell.isMarked) {
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.classList.add('hintCells');
                elCell.innerText = (cell.isMine) ? MINE : cell.minesAroundCount;
                clearHint();
            }
        }
    }
}
function clearHint() {
    setTimeout(function () {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j];
                if (!cell.isShown && !cell.isMarked) {
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.innerText = EMPTY;
                    if (elCell.classList.contains('hintCells')) {
                        elCell.classList.remove('hintCells');
                    }
                }
            }
        }
    }, 600);
    gIsHintOn = false;
}
function renderSafeClicks() {
    var elSafeClick = document.querySelector('.safe-click span');
    elSafeClick.innerText = '';
    for (var i = 0; i < gLevel.SAFECLICKS; i++) {
        elSafeClick.innerText += SAFECLICK;
    }

}
function getSafeClicks() {
    var safeClickLocations = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var cellLocation = { i, j };
            if (!cell.isMarked && !cell.isMine && !cell.isShown) safeClickLocations.push(cellLocation);
        }
    }
    return safeClickLocations;
}
function safeClickClicked() {
    if (gLevel.SAFECLICKS === 0) return;
    var safeClickLocations = getSafeClicks();
    var safeClickLocation = safeClickLocations[getRandomIntInclusive(0, safeClickLocations.length - 1)];
    var i = safeClickLocation.i;
    var j = safeClickLocation.j;
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    gIntervalSafeClick = setInterval(function () {
        elCell.classList.add('safe-click-color');
        setTimeout(function () {
            elCell.classList.remove('safe-click-color');
        }, 300);
    }, 600);
    gLevel.SAFECLICKS--;
    renderSafeClicks();
    clearSafeClick();
}
function clearSafeClick() {
    setTimeout(function () {
        clearInterval(gIntervalSafeClick);
        gIntervalSafeClick = null;
    }, 2500);
}
function renderLives() {
    var elLife = document.querySelector('.lives span');
    elLife.innerText = '';
    for (var i = 0; i < gLevel.LIVES; i++) {
        elLife.innerText += LIFE;
    }
}
function stopwatch() {
    milsecounds++;
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
    gSumTime = minutes * 60 * 100 + secounds * 100 + milsecounds;
    var elTime = document.querySelector('.timer');
    elTime.innerText = displayMinutes + ":" + displaySecounds + ":" + displayMilsecounds;

}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function undo() {
    if (!gMoves.length) return
    if (gIsVictory || gIsGameOver) return
    var lastStep = gMoves.pop()
    var i = lastStep.i
    var j = lastStep.j
    var cell = gBoard[i][j]
    var a = lastStep.i
    var b = lastStep.j
    var cellUndo = {
        isMine: cell.isMine,
        isMarked: false,
        isShown: false,
        minesAroundCount: cell.minesAroundCount
    }
    gBoard[a][b] = cellUndo
    var elCellUndo = document.querySelector(`.cell-${i}-${j}`);
    elCellUndo.innerText = EMPTY
    if (elCellUndo.classList.contains('touched')) {
        gGame.shownCount--
        elCellUndo.classList.remove('touched')
    } else if (elCellUndo.classList.contains('flag')) {
        gGame.markedCount--
        elCellUndo.classList.remove('flag')
    } else if (elCellUndo.classList.contains('bomb')) {
        gGame.shownCount--
        gLevel.LIVES++
        renderLives()
        elCellUndo.classList.remove('bomb')
    }
}