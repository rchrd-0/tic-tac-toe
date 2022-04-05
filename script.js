const gameBoard = (() => {
  let board = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  const getBoard = () => [...board];

  return {
    getBoard
  }
  
})();

const displayController = (() => {
  const gameTiles = document.querySelectorAll('.game-tile');
  const marks = gameBoard.getBoard();

  const renderBoard = () => {
    for (let i = 0; i < gameTiles.length; i++) {
      gameTiles[i].textContent = marks[i];
    }
  }

  return {
    renderBoard
  }

})();