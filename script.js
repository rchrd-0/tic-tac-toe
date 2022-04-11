const gameBoard = (() => {
  const board = new Array(9).fill(null);

  const getBoard = () => [...board];
  const placeMark = (index, mark) => {
    board[index] = mark;
    displayController.renderBoard();
  }

  return {
    getBoard,
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
      const markCount = {
        X: board.filter(mark => mark === 'X').length,
        O: board.filter(mark => mark === 'O').length
      }
      const checkWinFor = Object.keys(markCount)
        .filter(player => markCount[player] >= 3);

      return (function() {
        let winner = {}
        checkWinFor.forEach(player => {
          let indices = [];
          for (let i = 0; i < board.length; i++) {
            if (board[i] === player) {
              indices.push(i);
            }
          }

          winConditions.forEach(condition => {
            if (condition.every(index => indices.includes(index))) {
              Object.assign(winner, {
                player: player,
                condition: [...condition]
              })
            }
          })
        })

        return winner
      })();
    })();

    if (Object.keys(getWinner).length === 0) {
      toggleTurn();
    } else {
      // End game
    }    
  }
  const toggleTurn = () => {
    p1.turn = !p1.turn;
    p2.turn = !p2.turn;
  }

  return {
    playMove
  }
})();

