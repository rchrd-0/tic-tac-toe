const Player = (name, mark) => {
  const getName = () => name;
  const getMark = () => mark;
  return {
    getName,
    getMark
  }
}

const gameBoard = (() => {
  const board = new Array(9).fill(null);

  const clearBoard = () => board.fill(null);
  const getBoard = () => [...board];
  const placeMark = (index, mark) => {
    board[index] = mark;
    displayController.renderBoard();
  }
  const resetBoard = () => {
    clearBoard();
    displayController.renderBoard();
  }

  return {
    getBoard,
    placeMark,
    resetBoard
  }
})();

const gameController = (() => {
  const CurrentPlayer = (name, mark, turn) => {
    const prototype = Player(name, mark);
    const getInitialTurn = () => turn;
    return Object.assign({}, prototype, {getInitialTurn}, {turn});
  }
  const p1 = CurrentPlayer('Player 1', 'X', true);
  const p2 = CurrentPlayer('Player 2', 'O', false);

  const toggleTurn = (...players) => players.forEach(p => p.turn = !p.turn);
  const resetTurns = (...players) => players.forEach(p => p.turn = p.getInitialTurn());
  const playMove = (tile) => {
    let activePlayer = (p1.turn) ? p1 : p2;
    let mark = activePlayer.getMark();
    gameBoard.placeMark(tile, mark);
    checkWin();
  }
  const checkWin = () => {
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
    const getWinner = (() => {
      const players = {
        p1: Object.assign({...p1}, {count: board.filter(mark => mark === p1.getMark()).length}),
        p2: Object.assign({...p2}, {count: board.filter(mark => mark === p2.getMark()).length})
      }
      let checkWinFor = Object.keys(players)
        .filter(p => players[p].count >= 3)
        .map(p => players[p].getMark());

      return (function() {
        let winningRow = {}
        checkWinFor.forEach(mark => {
          let indices = [];
          for (let i = 0; i < board.length; i++) {
            if (board[i] === mark) {
              indices.push(i);
            }
          }
          winConditions.forEach(condition => {
            if (condition.every(index => indices.includes(index))) {
              Object.assign(winningRow, {mark}, {row: [...condition].map(String)})
              // String conversion to map with data attributes
            } 
          })
        })

        if (Object.keys(winningRow).length > 0) {
          let winner = Object.keys(players)
            .filter (p => players[p].getMark() === winningRow.mark);
          winner = Object.assign({...players[winner]}, {row: winningRow.row});
          
          return winner
        }
      })();
    })();

    if (getWinner || !board.includes(null)) {
      if (getWinner) {
        displayController.endGame('win', {...getWinner});
      } else {
        displayController.endGame('draw');
      }
    } else {
      toggleTurn(p1, p2)
    }
  }
  const resetGame = () => {
    resetTurns(p1, p2);
    gameBoard.resetBoard();
  }

  return {
    playMove,
    resetGame
  }
})();

const displayController = (() => {
  const gameTiles = document.querySelectorAll('.game-tile');
  const restartButton = document.querySelector('#restart-button');

  const initInterface = () => {
    restartButton.textContent = 'Restart game';
    gameTiles.forEach(tile => tile.addEventListener('click', getTile));
  }
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
  const endGame = (state, winner = {}) => {
    gameTiles.forEach(tile => tile.removeEventListener('click', getTile));
    restartButton.textContent = 'New game';
    switch (state) {
      case 'draw': 
      // gameTiles.forEach(tile => tile.style.color = 'gray');
        console.log('Draw');
        break;
      case 'win':
        console.log(`${winner.getName()} wins!`);
        // const winningRow = [...gameTiles].filter(tile => winner.row
        //   .includes(tile.dataset.tileNum))
        // winningRow.forEach(tile => tile.style.color = 'red');
        break;
    }
  }
  const restartGame = () => {
    initInterface();
    gameController.resetGame();
  }

  restartButton.addEventListener('click', restartGame);

  return {
    initInterface,
    renderBoard,
    endGame
  }
})();

window.addEventListener('load', displayController.initInterface)