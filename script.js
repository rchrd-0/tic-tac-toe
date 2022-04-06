const gameBoard = (() => {
  const board = new Array(9).fill(null);

  const getBoard = () => [...board];

  return {
    getBoard
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
  const toggleTurn = () => {
    p1.turn = !p1.turn;
    p2.turn = !p2.turn;
  }
})();