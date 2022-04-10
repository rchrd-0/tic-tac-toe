const gameBoard = (() => {
  const board = new Array(9).fill(null);

  const getBoard = () => [...board];
  const placeMark = (index, mark) => {
    board[index] = mark;
    displayController.renderBoard();
  }

  const getMarkCount = () => {
    return {
      X: board.filter(mark => mark == 'X').length,
      O: board.filter(mark => mark == 'O').length,
    }
  }

  return {
    getBoard,
    getMarkCount,
    placeMark
  }
})();

const displayController = (() => {
  const gameTiles = document.querySelectorAll('.game-tile');

  const renderBoard = () => {
    const board = gameBoard.getBoard();
    for (let i = 0; i < gameTiles.length; i++) {
      gameTiles[i].textContent = board[i];
    }
  }
  const getTile = (e) => {
    let targetTile = e.target;
    let tileNum = targetTile.dataset.tileNum;
    if (!targetTile.textContent) {
      gameController.playMove(tileNum);
    }
  }

  gameTiles.forEach(tile => tile.addEventListener('click', getTile))

  return {
    renderBoard
  }
})();

const gameController = (() => {
  const Player = (name, mark, turn) => {
    return {
      name,
      mark,
      turn
    }
  };
  const p1 = Player('Player 1', 'X', true);
  const p2 = Player('Player 2', 'O', false);
  const getActivePlayer = () => (p1.turn) ? p1 : p2;

  const playMove = (tile) => {
    let mark = getActivePlayer().mark;
    gameBoard.placeMark(tile, mark);

    let markCount = gameBoard.getMarkCount();
    checkWin(markCount);

    toggleTurn();
  }
  const checkWin = (markCount) => {
    const board = gameBoard.getBoard();
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]
    const checkWinFor = Object.keys(markCount)
      .filter(player => markCount[player] >= 3);

    
  }
  const toggleTurn = () => {
    p1.turn = !p1.turn;
    p2.turn = !p2.turn;
  }

  return {
    playMove
  }
})();

