const Gameboard = (function() {
    let board = ["", "", "", "", "", "", "", "", ""];
    const getBoard = () => [...board];
    const placeMark = (index, mark) => {
        if (board[index] === "") {
            board[index] = mark;
            return true;
        }
        return false;
    };
    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };
    return { getBoard, placeMark, resetBoard };
})();

const createPlayer = (name, marker) => {
    return { name, marker };
};

const gameController = (function() {
    let player1;
    let player2;
    let activePlayer;
    let gameOver = false;
    let winner = null;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const startGame = (name1, name2) => {
        player1 = createPlayer(name1 || "Player 1", "X");
        player2 = createPlayer(name2 || "Player 2", "O");
        activePlayer = player1;
        gameOver = false;
        winner = null;
        Gameboard.resetBoard();
    };

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        const isWin = winningConditions.some(condition => {
            return condition.every(index => board[index] === activePlayer.marker);
        });

        if (isWin) return "win";
        if (!board.includes("")) return "tie";
        return null;
    };

    const playRound = (index) => {
        if (gameOver || !player1) return;
        if (Gameboard.placeMark(index, activePlayer.marker)) {
            const result = checkWinner();
            if (result === "win") {
                winner = activePlayer.name;
                gameOver = true;
            } else if (result === "tie") {
                winner = "Tie";
                gameOver = true;
            } else {
                activePlayer = activePlayer === player1 ? player2 : player1;
            }
        }
    };

    const resetGame = () => {
        gameOver = false;
        winner = null;
        player1 = null; // Forces player to "Start" again
        Gameboard.resetBoard();
    };

    return { 
        playRound, 
        startGame, 
        resetGame,
        getActivePlayer: () => activePlayer, 
        getGameOver: () => gameOver, 
        getWinner: () => winner 
    };
})();

const displayController = (function() {
    const boardElement = document.getElementById("gameboard");
    const playerDisplay = document.getElementById("display-player");
    const restartBtn = document.getElementById("restart-btn");
    const startBtn = document.getElementById("start-btn");
    const setupContainer = document.getElementById("setup-container");

    const updateDisplay = () => {
        boardElement.innerHTML = "";
        const board = Gameboard.getBoard();
        const isGameOver = gameController.getGameOver();
        const winner = gameController.getWinner();

        // 1. Render the cells
        board.forEach((mark, index) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = mark;
            
            if (!isGameOver && mark === "") {
                cell.addEventListener("click", () => {
                    gameController.playRound(index);
                    updateDisplay();
                });
            }
            boardElement.appendChild(cell); // Always append, even if game is over
        });

        // 2. Update status text
        if (isGameOver) {
            playerDisplay.textContent = winner === "Tie" ? "It's a Tie!" : `${winner} Wins!`;
        } else {
            const activePlayer = gameController.getActivePlayer();
            if (activePlayer) {
                playerDisplay.textContent = `${activePlayer.name}'s Turn (${activePlayer.marker})`;
            }
        }
    };

    // Keep Event Listeners OUTSIDE the updateDisplay loop
    startBtn.addEventListener("click", () => {
        const p1Name = document.getElementById("p1-name").value;
        const p2Name = document.getElementById("p2-name").value;
        gameController.startGame(p1Name, p2Name);
        setupContainer.style.display = "none";
        updateDisplay();
    });

    restartBtn.addEventListener("click", () => {
        gameController.resetGame();
        setupContainer.style.display = "block";
        playerDisplay.textContent = "Enter names to start";
        updateDisplay();
    });

    return { updateDisplay };
})();