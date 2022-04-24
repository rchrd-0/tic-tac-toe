const Player = (playerNum, mark) => {
  const getPlayerNum = () => playerNum;
  const getMark = () => mark;
  return {
    getPlayerNum,
    getMark
  }
}

const form = document.querySelector('#player-names');
const button = document.querySelector('#start-game-btn');
button.addEventListener('click', startGame);

function startGame() {
  let inputNames = [form.elements['p1-name'].value, form.elements['p2-name'].value];
  players.setNames(inputNames);
  displayController.initInterface();
  form.classList.add('hidden');
}

const players = (() => {
    const CurrentPlayer = (playerNum, mark, turn) => {
      const prototype = Player(playerNum, mark);
      const getInitialTurn = () => turn;
      const getUsername = () => usernames[playerNum - 1];
      return Object.assign({}, prototype, {getInitialTurn}, {getUsername}, {turn});
    }
    const usernamesDefault = {
      0: 'Player 1',
      1: 'Player 2'
    }
    let usernames = Object.assign({}, usernamesDefault);
    const p1 = CurrentPlayer(1, 'X', true);
    const p2 = CurrentPlayer(2, 'O', false);
    const getP1 = () => {return {...p1}};
    const getP2 = () => {return {...p2}};

    const setNames = (names) => {
      for (let i = 0; i < names.length; i++) {
        if (names[i] === '') {
          names[i] = usernamesDefault[i];
        }
      }
      usernames = Object.assign({}, {...names});
    }
    
    return {
      setNames,
      getP1,
      getP2
    }
  })();

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
  const p1 = players.getP1();
  const p2 = players.getP2();
  const getActivePlayer = () => (p1.turn) ? {...p1} : {...p2};
  const toggleTurn = (...players) => {
    players.forEach(p => p.turn = !p.turn)
    let name = getActivePlayer()
        .getUsername();
    displayController.updateMessage(`${name}\'s turn`);
  }
  const resetTurns = (...players) => players.forEach(p => p.turn = p.getInitialTurn());
  const playMove = (tile) => {
    let mark = getActivePlayer()
      .getMark();
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
              // String conversion to map data attributes
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
      let result = (getWinner) ? {...getWinner} : {};
      displayController.endGame(result);
    } else {
      toggleTurn(p1, p2)
    }
  }
  const resetGame = () => {
    resetTurns(p1, p2);
    gameBoard.resetBoard();
  }

  return {
    getActivePlayer,
    playMove,
    resetGame,
  }
})();

const displayController = (() => {
  const gameTiles = document.querySelectorAll('.game-tile');
  const restartButton = document.querySelector('#restart');
  const gameMessage = document.querySelector('#game-message');

  const initInterface = () => {
    let startingPlayer = gameController.getActivePlayer()
      .getUsername();
    gameMessage.textContent = `${startingPlayer}\'s turn`;
    restartButton.textContent = 'Restart';
    gameTiles.forEach(tile => tile.addEventListener('click', getTile));
    gameTiles.forEach(tile => tile.className = 'game-tile');
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
  const updateMessage = (message) => gameMessage.textContent = message;
  const endGame = (player = {}) => {
    gameTiles.forEach(tile => tile.removeEventListener('click', getTile));
    restartButton.textContent = 'Play again';
    if (Object.keys(player).length > 0) {
      updateMessage(`${player.getUsername()} wins!`);
      [...gameTiles].filter(tile => player.row.includes(tile.dataset.tileNum))
        .forEach(tile => tile.classList.add('row-win'));
    } else {
      updateMessage('It\'s a draw ...');
      gameTiles.forEach(tile => tile.classList.add('board-draw'))
    }
  }
  const restartGame = () => {
    gameController.resetGame();
    initInterface();
  }

  restartButton.addEventListener('click', restartGame);

  return {
    initInterface,
    renderBoard,
    updateMessage,
    endGame
  }
})();