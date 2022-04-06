const gameBoard = (() => {
  const board = new Array(9).fill(null);

  const getBoard = () => [...board];
  // const placeMark = (index, mark) => {
  //   board[index] = mark;
  //   displayController.renderBoard();
  // }

  return {
    getBoard
    // placeMark
  }
})();

const displayController = (() => {
  const gameTiles = document.querySelectorAll('.game-tile');

  const renderBoard = () => {
    const marks = gameBoard.getBoard();
    for (let i = 0; i < gameTiles.length; i++) {
      gameTiles[i].textContent = marks[i];
    }
  }

  const getTile = (e) => {
    let targetTile = e.target;
    let tileNum = targetTile.dataset.tileNum;
    if (targetTile.textContent === undefined) {
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
    toggleTurn();
  }
  const toggleTurn = () => {
    p1.turn = !p1.turn;
    p2.turn = !p2.turn;
  }
  return {
    playMove
  }
})();