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
  const p1 = Player(1, 'X', true);
  const p2 = Player(2, 'O', false);
  const getP1 = () => {
    return {...p1}
  }
  const getP2 = () => {
    return {...p2}
  }
  const usernamesDefault = {
    0: 'Player 1',
    1: 'Player 2',
    2: 'Computer'
  }
  let usernames = Object.assign({}, usernamesDefault);
  const setNames = (names) => {
    for (let i = 0; i < names.length; i++) {
      if (names[i] === '') {
        names[i] = usernamesDefault[i];
      } else if (names[1] === 'com') {
        names[1] = usernamesDefault[2];
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
    displayController.displayTurn();
  }
  const resetTurns = (...players) => players.forEach(p => p.turn = p.getInitialTurn());
  const playMove = tile => {
    let mark = getActivePlayer().getMark();
    let name = getActivePlayer().getUsername();
    gameBoard.placeMark(tile, mark);
    findWin(name)
  }

  let onePlayerMode = null;
  const getPlayerMode = () => onePlayerMode;
  const setOnePlayerMode = bool => onePlayerMode = bool;
  const isBotTurn = () => (getPlayerMode() && getActivePlayer().getPlayerNum() === 2)
  

  const checkWin = board => {
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
    for (let i = 0; i < winConditions.length; i++) {
      let winX = (winConditions[i].every(position => (board[position] === 'X')));
      let winO = (winConditions[i].every(position => (board[position] === 'O')));
      if (winX || winO) {
        return winConditions[i]
      }
    }
  }
  const findWin = name => {
    const thisBoard = gameBoard.getBoard();
    const gameDraw = !thisBoard.includes(null);
    const gameWin = !!checkWin(thisBoard);
    
    switch (true) {
      case gameWin:
        const player = {
          [name]: checkWin(thisBoard).map(String)
        }
        displayController.endGame(player);
        break;
      case gameDraw:
        displayController.endGame();
        break;
      default:
        toggleTurn(p1, p2);
        
        if (isBotTurn()) {
          botLogic.playBestMove(thisBoard);
        }
    }
  }
  const botLogic = (() => {
    let player = 'X';
    let bot = 'O';
    const noMovesLeft = board => board.filter(tiles => tiles === null).length === 0;
    const evaluateBoard = board => {
      const winExists = !!checkWin(board);
      if (winExists) {
        let winningRow = checkWin(board);
        let winner = board[winningRow[0]];

        return (winner === bot) ? +10 : -10;
      } else {
        return 0;
      }
    }
    const minimax = (board, depth, isMaximizing) => {
      let score = evaluateBoard(board);
      // Evalute and return score for given board state
      if (score === 10) {
        return score - depth;
      } else if (score === -10) {
        return score + depth;
      } else if (noMovesLeft(board)) {
        return 0;
      }

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = bot;
            let score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = (score > bestScore) ? score : bestScore;
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = player;
            let score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = (score < bestScore) ? score : bestScore;
          }
        }
        return bestScore;
      }
      
    }
    const findBestMove = (board) => {
      let bestScore = -Infinity;
      let bestMove;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = bot;
          let score = minimax(board, 0, false);
          board[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return bestMove;
    }
    const playBestMove = (board) => {
      let bestMove = findBestMove(board);
      setTimeout(() => {
        playMove(bestMove);
      }, 400)
    }
    return {
      playBestMove
    }
  })();

  const resetGame = () => {
    resetTurns(p1, p2);
    gameBoard.resetBoard();
  }

  return {
    setOnePlayerMode,
    isBotTurn,
    getActivePlayer,
    playMove,
    resetGame,
    checkWin
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
    const inputValues = playerNamesForm.querySelectorAll('input[type="text"');
    const gameModeButton = [...document.querySelector('.game-modes').children];
    const backButton = document.querySelector('#back-btn');
    const p2Input = playerNamesForm.querySelector('input#p2-name');

    const hideMenu = (...menus) => {
      menus.forEach(menu => menu.classList.toggle('hidden'));
    }
    const changeMenu = e => {
      const menu = e.target.dataset.menu;
      const p2Row = playerNamesForm.querySelector('#p2-row');
      hideMenu(gameModesMenu, playerNamesMenu);
      switch (menu) {
        case 'select-1p':
          p2Row.classList.add('input-disabled');
          p2Input.disabled = true;
          break;
        case 'select-2p':
          p2Row.classList.remove('input-disabled');
          p2Input.disabled = false;
          break;
        case 'back':
          playerNamesForm.reset();
          break;
      }
    }
    const resetMenu = () => hideMenu(startMenu, playerNamesMenu, gameModesMenu);
    const startGame = e => {
      e.preventDefault();
      const namesArr = [];
      p2Input.value = (p2Input.disabled) ? 'com' : p2Input.value;
      inputValues.forEach(input => namesArr.push(input.value))
      gameController.setOnePlayerMode(p2Input.disabled);

      players.setNames(namesArr);
      playerNamesForm.reset();
      displayController.renderUI();
      hideMenu(startMenu);
    }

    // Event listeners
    gameModeButton.forEach(button => button.addEventListener('click', changeMenu));
    playerNamesForm.addEventListener('submit', startGame);
    backButton.addEventListener('click', changeMenu)

    return {
      resetMenu
    }
  })();

  const renderUI = () => {
    const displayUsernames = document.querySelectorAll('.card-username');
    displayUsernames[0].textContent = players.getP1().getUsername();
    displayUsernames[1].textContent = players.getP2().getUsername();
    gameMessage.textContent = '';
    restartButton.textContent = 'Restart';
    gameTiles.forEach(tile => {
      tile.addEventListener('click', getTile);
      tile.className = 'game-tile';
    })
    displayTurn();
  }
  const renderBoard = () => {
    const thisBoard = gameBoard.getBoard();
    for (let i = 0; i < gameTiles.length; i++) {
      gameTiles[i].textContent = thisBoard[i];
    }
  }

  const getTile = e => {
    let targetTile = e.target;
    let tileNum = targetTile.dataset.tileNum;
    if (gameController.isBotTurn()) {
      return
    }
    if (!targetTile.textContent) {
      gameController.playMove(tileNum);
    } 
  }
  const updateMessage = message => gameMessage.textContent = message;
  const displayTurn = () => {
    const playerCards = document.querySelectorAll('.player-card');
    const activePlayer = gameController.getActivePlayer().getPlayerNum();
    for (let i = 0; i < playerCards.length; i++) {
      if (playerCards[i].dataset.playerCardNum == activePlayer) {
        playerCards[i].classList.add('active-turn');
      } else {
        playerCards[i].classList.remove('active-turn');
      }
    }
  }
  const endGame = (player = {}) => {
    gameTiles.forEach(tile => tile.removeEventListener('click', getTile));
    restartButton.textContent = 'Play again';
    const isWin = Object.keys(player).length > 0;

    if (isWin) {
      const name = Object.keys(player).pop();
      updateMessage(`${name} wins!`);
      [...gameTiles].filter(tile => player[name].includes(tile.dataset.tileNum))
        .forEach(tile => tile.classList.add('row-win'));
    } else {
      updateMessage('It\'s a draw ...')
      gameTiles.forEach(tile => tile.classList.add('board-draw'));
    }
  }
  const restartGame = () => {
    // if (gameController.isBotTurn()) {
    //   return
    // }
    gameController.resetGame();
    renderUI();
  }

  // Event listeners
  restartButton.addEventListener('click', restartGame);
  newGameButton.addEventListener('click', () => {
    // if (gameController.isBotTurn()) {
    //   return
    // }
    restartGame();
    startMenuController.resetMenu();
  })

  return {
    renderUI,
    renderBoard,
    updateMessage,
    endGame,
    displayTurn
  }
})();