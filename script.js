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
    toggleTurn();
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
        p1: Object.assign({...p1}, {count: board.filter(mark => mark === p1.mark).length}),
        p2: Object.assign({...p2}, {count: board.filter(mark => mark === p2.mark).length})
      }
      const checkWinFor = Object.keys(players)
        .filter(p => players[p].count >= 3)
        .map(p => players[p].mark);
      // Array [X, O] if number of marks >= 3

      return (function() {
        let winningRow = {}
        checkWinFor.forEach(mark => {
          let indices = [];
          for (let i = 0; i < board.length; i++) {
            if (board[i] === mark) {
              indices.push(i);
            }
          }
          // [0, 1, 2] array index nums of each mark >= 3

          winConditions.forEach(condition => {
            if (condition.every(index => indices.includes(index))) {
              Object.assign(winningRow, {
                mark: mark,
                row: [...condition]
              })
            }
          })
        })
        
        let winner = Object.keys(players)
          .filter (p => players[p].mark === winningRow.mark);
        winner = Object.assign({...players[winner]}, {row: winningRow.row});

        return winner;
      })();
    })();

    // const endGame = () => {
    //   if (!board.includes(null)) {
    //     console.log('Draw');
    //   } else {
    //     let player = (getWinner.player === p1.mark) ? p1.name : p2.name;
    //     console.log(`${player} wins!`);
    //   }
    // }

    // if (Object.keys(getWinner).length === 0 && board.includes(null)) {
    //   toggleTurn()
    // } else {
    //   endGame();
    // }

  }
  const toggleTurn = () => {
    p1.turn = !p1.turn;
    p2.turn = !p2.turn;
  }

  return {
    playMove,
  }
})();

