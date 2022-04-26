const players = (() => {
  const Player = (playerNum, mark, turn) => {
    const getPlayerNum = () => playerNum;
    const getMark = () => mark;
    const getInitialTurn = () => turn;
    const getUsername = () => usernames[playerNum - 1];
  
    return {
      getPlayerNum,
      getMark,
      getInitialTurn,
      getUsername,
      turn
    }
  }
  const usernamesDefault = {
    0: 'Player 1',
    1: 'Player 2'
  }
  let usernames = Object.assign({}, usernamesDefault);
  const p1 = Player(1, 'X', true);
  const p2 = Player(2, 'O', false);
  const getP1 = () => {
    return {...p1}
  }
  const getP2 = () => {
    return {...p2}
  }
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
    let name = getActivePlayer().getUsername();
    displayController.updateMessage(`${name}\'s turn`);
  }
  const resetTurns = (...players) => players.forEach(p => p.turn = p.getInitialTurn());
  const playMove = (tile) => {
    let mark = getActivePlayer().getMark();
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
            .filter(p => players[p].getMark() === winningRow.mark);
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
  const newGameButton = document.querySelector('#new-game');
  const gameMessage = document.querySelector('#game-message');

  const startMenuController = (() => {
    const startMenu = document.querySelector('#start-menu');
    const gameModesMenu = document.querySelector('#game-modes-container');
    const playerNamesMenu = document.querySelector('#player-names-container');
    const playerNamesForm = document.querySelector('#player-names');
    const gameModeButton = [...document.querySelector('.game-modes').children];
    const backButton = document.querySelector('#back-btn');

    const hideMenu = (...menus) => {
      menus.forEach(menu => menu.classList.toggle('hidden'));
    }
    const changeMenu = (e) => {
      const menu = e.target.dataset.menu;
      hideMenu(gameModesMenu);
      switch (menu) {
        case 'select-1p':
          console.log('1 player');
          break;
        case 'select-2p':
        case 'back':
          hideMenu(playerNamesMenu);
          break;
      }
    }
    const resetMenu = () => hideMenu(startMenu, playerNamesMenu, gameModesMenu);
    const readNames = (e) => {
      e.preventDefault();
      const inputValues = playerNamesForm.querySelectorAll('input[type="text"');
      const namesArr = [];
      inputValues.forEach(input => {
        namesArr.push(input.value);
        input.value = '';
      })

      players.setNames(namesArr);
      displayController.renderInterface();
      hideMenu(startMenu);
    }

    // Event listeners
    gameModeButton.forEach(button => button.addEventListener('click', changeMenu));
    playerNamesForm.addEventListener('submit', readNames);
    backButton.addEventListener('click', changeMenu)

    return {
      resetMenu
    }
  })();

  const renderInterface = () => {
    const displayUsernames = document.querySelectorAll('.card-username');
    const startingPlayer = gameController.getActivePlayer().getUsername();
    
    displayUsernames[0].textContent = players.getP1().getUsername();
    displayUsernames[1].textContent = players.getP2().getUsername();
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
    renderInterface();
  }

  // Event listeners
  restartButton.addEventListener('click', restartGame);
  newGameButton.addEventListener('click', startMenuController.resetMenu)

  return {
    renderInterface,
    renderBoard,
    updateMessage,
    endGame
  }
})();