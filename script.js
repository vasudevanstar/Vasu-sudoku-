// --- Timer ---
let timerInterval;
let elapsedSeconds = 0;
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        document.getElementById('timer').textContent = 'Time: ' + formatTime(elapsedSeconds);
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }
function resetTimer() {
    elapsedSeconds = 0;
    document.getElementById('timer').textContent = 'Time: 00:00';
}
function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// --- Win Animation (Scaffold) ---
function showWinAnimation() {
    // Example: flash the board or show a confetti animation
    alert('Congratulations! You solved the puzzle!');
}

// --- Dark Mode Toggle (Scaffold) ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('sudoku-board');
    const difficultySelector = document.getElementById('difficulty-selector');
    const notesToggleBtn = document.getElementById('notes-toggle-btn');
    const checkBtn = document.getElementById('check-btn');
    const solveBtn = document.getElementById('solve-btn');
    const hintBtn = document.getElementById('hint-btn');
    const darkModeBtn = document.getElementById('darkmode-btn');
    const customBtn = document.getElementById('custom-btn');
    const messageEl = document.getElementById('message');

    const difficulties = { easy: 35, medium: 45, hard: 55 };
    let currentDifficulty = 'easy';
    let solvedBoard;
    let userBoard;
    let isNotesMode = false;
    let selectedCell = null;

    function generateBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;

            const cellInput = document.createElement('input');
            cellInput.type = 'number';
            cellInput.classList.add('cell-input');
            cellInput.maxLength = 1;

            const notesGrid = document.createElement('div');
            notesGrid.classList.add('notes-grid');
            for (let j = 1; j <= 9; j++) {
                const noteCell = document.createElement('div');
                noteCell.classList.add('note-cell');
                noteCell.dataset.note = j;
                notesGrid.appendChild(noteCell);
            }

            cell.appendChild(cellInput);
            cell.appendChild(notesGrid);
            boardElement.appendChild(cell);
        }
    }

    function displayBoard() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const index = i * 9 + j;
                const cell = boardElement.children[index];
                const input = cell.querySelector('.cell-input');
                const notes = userBoard[i][j].notes;

                cell.classList.remove('given', 'error', 'selected', 'highlighted', 'same-number-highlight', 'notes-active');
                input.value = '';

                if (userBoard[i][j].isGiven) {
                    cell.classList.add('given');
                    input.value = userBoard[i][j].value;
                } else if (userBoard[i][j].value) {
                    input.value = userBoard[i][j].value;
                }

                // Display notes
                const noteCells = cell.querySelectorAll('.note-cell');
                noteCells.forEach(nc => nc.textContent = '');
                if (notes.size > 0 && !userBoard[i][j].value) {
                    notes.forEach(noteNum => {
                        const noteCell = cell.querySelector(`.note-cell[data-note='${noteNum}']`);
                        if (noteCell) noteCell.textContent = noteNum;
                    });
                }
            }
        }
    }

    function startNewGame() {
        let board = Array(9).fill(0).map(() => Array(9).fill(0));
        solveSudoku(board);
        solvedBoard = board.map(row => [...row]);

        let puzzleBoard = createPuzzle(solvedBoard, difficulties[currentDifficulty]);

        userBoard = puzzleBoard.map((row, r) => row.map((val, c) => ({
            value: val === 0 ? null : val,
            isGiven: val !== 0,
            notes: new Set()
        })));

        displayBoard();
        messageEl.textContent = '';
        resetTimer();
        startTimer();
    }

    function createPuzzle(fullBoard, cellsToRemove) {
        let puzzle = fullBoard.map(row => [...row]);
        let removed = 0;
        while (removed < cellsToRemove) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }
        return puzzle;
    }

    function solveSudoku(board) {
        let empty = findEmpty(board);
        if (!empty) return true;
        let [row, col] = empty;
        let nums = shuffle([...Array(9).keys()].map(i => i + 1));

        for (let num of nums) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solveSudoku(board)) return true;
                board[row][col] = 0; // Backtrack
            }
        }
        return false;
    }

    function isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
        for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }

    function isMoveValid(r, c, num) {
        // Check if the number is valid in the context of the user's board
         for (let x = 0; x < 9; x++) {
            if (x !== c && userBoard[r][x].value === num) return false;
        }
        for (let x = 0; x < 9; x++) {
            if (x !== r && userBoard[x][c].value === num) return false;
        }
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if ((boxRow + i !== r || boxCol + j !== c) && userBoard[boxRow + i][boxCol + j].value === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function findEmpty(board) {
        for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (board[i][j] === 0) return [i, j];
        return null;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function clearHighlights() {
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('selected', 'highlighted', 'same-number-highlight');
        });
    }

    function highlightCells(row, col) {
        clearHighlights();
        boardElement.children[row * 9 + col].classList.add('selected');

        // Highlight row and col
        for (let i = 0; i < 9; i++) {
            boardElement.children[row * 9 + i].classList.add('highlighted');
            boardElement.children[i * 9 + col].classList.add('highlighted');
        }

        // Highlight 3x3 box
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                boardElement.children[(boxRowStart + i) * 9 + (boxColStart + j)].classList.add('highlighted');
            }
        }

        const num = userBoard[row][col].value;
        if (num) {
            for (let i = 0; i < 81; i++) {
                 const r = Math.floor(i / 9);
                 const c = i % 9;
                 if (userBoard[r][c].value === num) {
                     boardElement.children[i].classList.add('same-number-highlight');
                 }
            }
        }
    }

    // --- Event Handlers ---
    boardElement.addEventListener('click', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell || cell.classList.contains('given')) return;

        const index = parseInt(cell.dataset.index);
        const row = Math.floor(index / 9);
        const col = index % 9;
        selectedCell = { row, col, cell };

        highlightCells(row, col);

        if (isNotesMode) {
            cell.classList.add('notes-active');
            const noteTarget = e.target.closest('.note-cell');
            if (noteTarget) {
                const noteNum = parseInt(noteTarget.dataset.note, 10);
                const notes = userBoard[row][col].notes;
                if (notes.has(noteNum)) {
                    notes.delete(noteNum);
                    noteTarget.textContent = '';
                } else {
                    notes.add(noteNum);
                    noteTarget.textContent = noteNum;
                }
            }
        } else {
            document.querySelectorAll('.notes-active').forEach(c => c.classList.remove('notes-active'));
            cell.querySelector('.cell-input').focus();
        }
    });

    boardElement.addEventListener('input', (e) => {
        const input = e.target.closest('.cell-input');
        if (!input || isNotesMode) return;

        const cell = input.parentElement;
        const index = parseInt(cell.dataset.index);
        const row = Math.floor(index / 9);
        const col = index % 9;

        // Clear notes if a number is entered
        userBoard[row][col].notes.clear();
        cell.querySelectorAll('.note-cell').forEach(nc => nc.textContent = '');

        let value = parseInt(input.value, 10);
        if (input.value.length > 1) {
            input.value = input.value.slice(-1);
            value = parseInt(input.value, 10);
        }
        if (isNaN(value) || value < 1 || value > 9) {
            input.value = '';
            userBoard[row][col].value = null;
            cell.classList.remove('error');
        } else {
            userBoard[row][col].value = value;
            if (isMoveValid(row, col, value)) {
                cell.classList.remove('error');
            } else {
                cell.classList.add('error');
            }
        }
         highlightCells(row, col);
    });

    difficultySelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentDifficulty = e.target.dataset.difficulty;
            difficultySelector.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            startNewGame();
        }
    });

    notesToggleBtn.addEventListener('click', () => {
        isNotesMode = !isNotesMode;
        notesToggleBtn.textContent = `Notes: ${isNotesMode ? 'ON' : 'OFF'}`;
        notesToggleBtn.classList.toggle('active', isNotesMode);
        document.querySelectorAll('.notes-active').forEach(c => c.classList.remove('notes-active'));
        if (selectedCell) {
            boardElement.children[selectedCell.row * 9 + selectedCell.col].querySelector('.cell-input').blur();
        }
    });

    checkBtn.addEventListener('click', () => {
        let isComplete = true;
        let isCorrect = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cellData = userBoard[i][j];
                if (!cellData.value) {
                    isComplete = false;
                } else if (!cellData.isGiven && cellData.value !== solvedBoard[i][j]) {
                    isCorrect = false;
                    boardElement.children[i*9+j].classList.add('error');
                }
            }
        }
        if (!isComplete) {
            messageEl.textContent = "Board isn't complete.";
            messageEl.style.color = '#e67e22';
        } else if (isCorrect) {
            messageEl.textContent = "Success! You solved it! 🎉";
            messageEl.style.color = '#2ecc71';
            showWinAnimation();
            stopTimer();
        } else {
            messageEl.textContent = "Found errors. Keep trying!";
            messageEl.style.color = '#e74c3c';
        }
    });

    solveBtn.addEventListener('click', () => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                userBoard[i][j].value = solvedBoard[i][j];
                userBoard[i][j].notes.clear();
            }
        }
        displayBoard();
        messageEl.textContent = "Puzzle solved.";
        messageEl.style.color = '#3498db';
        stopTimer();
    });

    // --- New Action Buttons ---
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            showHint();
        });
    }
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            toggleDarkMode();
        });
    }
    if (customBtn) {
        customBtn.addEventListener('click', () => {
            uploadCustomPuzzle();
        });
    }


    // --- Initial Setup ---
    generateBoard();
    startNewGame();
});