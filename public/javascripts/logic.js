/* ================================================================================================
    CARD CLASS
================================================================================================ */

class Card {
  constructor(suitId, rankId) {
    this.suitId = suitId;
    this.rankId = rankId;

    if (rankId == 1) {
        this.rank = 'Ace';
        this.value = 1;
    } else if (rankId == 11) {
      this.rank = 'Jack';
      this.value = 10;
    } else if (rankId == 12) {
      this.rank = 'Queen';
      this.value = 10;
    } else if (rankId == 13) {
      this.rank = 'King';
      this.value = 10;
    } else if (2 <= rankId && rankId <= 10) {
      this.rank = String(rankId);
      this.value = rankId;
    } else {
      this.rank = "RankError";
      this.value = -1;
    }

    if (suitId == 1) {
      this.suit = "Diamonds";
    } else if (suitId == 2) {
      this.suit = "Hearts";
    } else if (suitId == 3) {
      this.suit = "Spades";
    } else if (suitId == 4) {
      this.suit = "Clubs";
    } else {
      this.suit = 'SuitError';
    }

    this.shortName = this.rank[0] + this.suit[0];
    if (rankId == 10) this.shortName = this.rank + this.suit[0];

    this.longName = this.rank + " of " + this.suit;
  }
}

/* ================================================================================================
    REMOVE A RANDOM CARD FROM THE DECK
================================================================================================ */

function randomCard() {
  const len = status.deck.length;
  let cardIndex = Math.floor(Math.random() * len);
  let card = status.deck[cardIndex];
  status.deck.splice(cardIndex, 1);
  return card;
}

/* ================================================================================================
    TRACKING OBJECTS
================================================================================================ */

const tally = {wins: 0, losses: 0, computerTotal: 0, playerTotal: 0};
const blocked = {player: false, computer: false};
const hand = {player: [], computer: []};
const status = {deck: [], upCard: {}, activeSuit: ''};

/* ================================================================================================
    SETTING UP THE HANDS AND INTIAL CARDS
================================================================================================ */

function initializeGame() {
  // Reset tracking object properties
  status.deck = [];
  hand.player = [];
  hand.computer = [];
  blocked.player = false;
  blocked.computer = false;
  
  // Build the deck
  for (let suitId = 1; suitId < 5; suitId++) {
    for (let rankId = 1; rankId < 14; rankId++) {
      let newCard = new Card(suitId, rankId);
      if (newCard.rank == 8) newCard.value = 50;
      status.deck.push(newCard);
    }
  }

  // Build the hands
  for (let i = 0; i < 5; i++) {
    let p_card = randomCard();
    hand.player.push(p_card);
    let c_card = randomCard();
    hand.computer.push(c_card);
  }

  // Determine the starting up card and suit
  status.upCard = randomCard();
  status.activeSuit = status.upCard.suit;

  // Setup the game board
  setupBoard();
}

/* ================================================================================================
    SETTING UP THE BOARD
================================================================================================ */

function setupBoard() {
  // Show the computer's hand
  for (let i = 0; i < 5; i++) {
    setTimeout(() => $(`#card-${i + 1}`).fadeIn().css({display: 'inline-block'}), 600 * i);
  }

  // Show the player's hand
  setTimeout(() => {
    for (let j = 0; j < hand.player.length; j++) {
      let suit = hand.player[j].shortName;

      setTimeout(() => {
        $(`#card-${j + 6}`)
        .attr('data-card', suit)
        .draggable(dragOpt)
        .css({display: 'inline-block'})
        .fadeIn();
      }, 600 * j);
    }
  }, 300);

  // Show the play area
  setTimeout(() => {
    for (let i = 12; i < 53; i++) {
      $(`#card-${i}`).css({position: 'absolute'}).fadeIn();
    }

    $('#card-11')
    .attr('data-card', status.upCard.shortName)
    .addClass('front')
    .fadeIn()
    .css({display: 'inline-block'});
    setActiveSuitIcon();
  }, 3300);

  // Set the draggable/droppable features
  $('.card').not('.nodrag').draggable(dragOpt);
  $('#card-11').droppable({tolerance: 'fit'});

  // Set the drawing and suit selection handlers
  drawCard();
  selectSuit();
}

/* ================================================================================================
    PLAYER'S TURN
================================================================================================ */

function processPlayerMove(cardMoved) {
  // Change the active suit and upcard
  for (let i = 0; i < hand.player.length; i++ ) {
    if (hand.player[i].shortName === cardMoved) {
      status.activeSuit = hand.player[i].suit;
      status.upCard = hand.player.splice(i, 1)[0];
      setActiveSuitIcon();
    }
  }

  // Check for player win
  if (!hand.player.length) {
    gameOver('player');
  } else {
    if (cardMoved.substr(0, 1) === '8')  {
      getNewSuit();
    } else {
      setTimeout(() => computerTurn(), 500);
    }
  }
}

/* ================================================================================================
    COMPUTER'S TURN
================================================================================================ */

function computerTurn() {
  // Don't allow the player to move cards during this time
  $('#hand-player .card').draggable("disable");

  const options = [];

  // Loop through all of the computer's cards
  for (let i = 0; i < hand.computer.length; i++) {
    // If the current card is an 8...
    if (hand.computer[i].rank === '8') {
      status.upCard = hand.computer.splice(i, 1)[0];

      // Find out the total number of each suit in the computer's hand
      let suitTotals = [0, 0, 0, 0];
      for (let suit = 1; suit < 5; suit ++) {
        for (let card = 0; card < hand.computer.length; card++) {
          if (hand.computer[card].suitId === suit) suitTotals[suit - 1] += 1;
        }
      }
      let longSuit = 0;
      for (let j = 0; j < 4; j++) {
        if (suitTotals[j] > longSuit) longSuit = j;
      }
      // Set the active suit to the longest suit the computer has
      if (longSuit === 0) status.activeSuit = 'Diamonds';
      if (longSuit === 1) status.activeSuit = 'Hearts';
      if (longSuit === 2) status.activeSuit = 'Spades';
      if (longSuit === 3) status.activeSuit = 'Clubs';
      moveComputerCard('play', status.upCard.shortName);
      setActiveSuitIcon();
      return;

    // If the current card isn't an 8...
    } else {
      // Tag the card as a potential option if it matches suit or rank
      if (hand.computer[i].suit === status.activeSuit) {
        options.push(hand.computer[i]);
      } else if (hand.computer[i].rank === status.upCard.rank) {
        options.push(hand.computer[i]);
      }
    }
  }

  // If the computer has some options available...
  if (options.length > 0) {
    let bestPlay =  options[0];
    // Find the most valuable card in the options and play it
    for (let card = 0; card < options.length; card++) {
      if (options[card].value > bestPlay.value) bestPlay = options[card];
    }
    status.upCard = hand.computer.splice(hand.computer.indexOf(bestPlay), 1)[0];
    status.activeSuit = status.upCard.suit;
    moveComputerCard('play', status.upCard.shortName);
    setActiveSuitIcon();
    
    // Check for computer win
    if (!hand.computer.length) gameOver('computer');

  // If there are no playable options...
  } else {
    // If there is at least one card left in the deck, draw it...
    if (status.deck.length > 0) {
      let nextCard = randomCard();
      hand.computer.push(nextCard);
      moveComputerCard('draw');
    
    // Otherwise the computer is blocked.
    } else {
      blocked.computer = true;
    }
    // Check for a draw
    blocked.player = isPlayerBlocked();
    if (blocked.computer && blocked.player) gameOver('draw');
  }
}

/* ================================================================================================
    CHECK TO SEE IF THE PLAYER IS BLOCKED
================================================================================================ */

function isPlayerBlocked() {
  for (let i = 0; i < hand.player.length; i++) {
    if (hand.player[i].rank === '8') {
      return false;
    } else {
      if (hand.player[i].suit === status.activeSuit || hand.player[i].rank === status.upCard.rank) {
        return false;
      }
    }
  }
  return true;
}

/* ================================================================================================
    MOVE THE COMPUTER'S CARD
================================================================================================ */

function moveComputerCard(type, card) {
  // If the computer is playing a card...
  if (type === 'play') {
    // Show a random card from the computer's hand zone (assigning it the played card's stats)
    const numCards = $('#hand-computer .card').length;
    const randNum = Math.floor(Math.random() * numCards);
    const cardId = $('#hand-computer .card').eq(randNum).attr('id');
    $(`#${cardId}`).attr('data-card', card).addClass('front');
    // Move the card to the discard pile
    setTimeout(() => {
      $(`#${cardId}`).remove();
      $('#card-11').attr('data-card', card);
    }, 700);

  // If the computer is drawing a card...
  } else if (type === 'draw') {
    // Take a card from the deck and append it to the computer's hand zone
    $('#deck .card')
    .eq(0)
    .removeAttr('style')
    .css({display: 'inline-block'})
    .appendTo($('#hand-computer'));
    let newCardId = $('#hand-computer .card').eq(-1).attr('id');
    // Let the new card flash for a second to indicate it clearly
    $(`#${newCardId}`).addClass('flash');
    setTimeout(() => $(`#${newCardId}`).removeClass('flash'), 1000);
  }
  // Enable the player's ablilty to move cards
  setTimeout(() => $('#hand-player .card').draggable('enable'), 700);
}

/* ================================================================================================
    CHECK THE STATUS OF THE GAME
================================================================================================ */

  function gameOver(winner) {
    let msg;
    // Check who is the winner or if the game is a draw
    if (winner === 'player') {
      msg = 'Player wins.'
      // Reveal the computer's remaining cards
      hand.computer.forEach((card, i) => {
        const shortName = card.shortName;
        $('#hand-computer .card').eq(i).attr('data-card', shortName).addClass('front');
      });

    } else if (winner === 'computer') {
      msg = 'Computer wins.'

    } else if (winner === 'draw') {
      msg = 'Draw.'
    }

    // Calcuate the score and display it
    calculateScore(winner);
    $('#game-over h2').text(msg);
    $('#game-over').fadeIn();
  }

/* ================================================================================================
    CALCULATE SCORES
================================================================================================ */

function calculateScore(winner) {
  let computerPoints = 0;
  let playerPoints = 0;

  function playerWin() {
    for (let i = 0; i < hand.computer.length; i++) {
      playerPoints += hand.computer[i].value;
    }
    tally.playerTotal += playerPoints;
  }
  
  function computerWin() {
    for (let i = 0; i < hand.player.length; i++) {
      computerPoints += hand.player[i].value;
    }
    tally.computerTotal += computerPoints;
  }
  
  if (winner === 'player') {
    playerWin();
    tally.wins += 1;
  } else if (winner === 'computer') {
    computerWin();
    tally.losses += 1;
  } else if (winner === 'draw') {
    playerWin();
    computerWin();
  }

  $('#play-points').text(playerPoints);
  $('#comp-points').text(computerPoints);

  const computerLosses = tally.wins;
  const computerWins = tally.losses;
  $('#p-wins').text(tally.wins);
  $('#p-losses').text(tally.losses);
  $('#p-points').text(tally.playerTotal);
  $('#c-wins').text(computerWins);
  $('#c-losses').text(computerLosses);
  $('#c-points').text(tally.computerTotal);
}

/* ================================================================================================
    DRAWING A CARD
================================================================================================ */

function drawCard() {
  $('#deck').on('click', e => {
    let card = randomCard();
    hand.player.push(card);
    $(`#${e.target.id}`)
    .removeClass('nodrag')
    .addClass('front')
    .attr('data-card', card.shortName)
    .css({
      position: 'relative',
      display: 'inline-block'
    })
    .draggable(dragOpt)
    .appendTo($('#hand-player'));
    setTimeout(() => computerTurn(), 500);
  });
}

/* ================================================================================================
    PICKING A NEW SUIT
================================================================================================ */

function getNewSuit() {
  $('#select-suit').fadeIn('slow');
  $('#hand-player .card').draggable('disable')
}

function selectSuit() {
  $('.suit').on('click', e => {
    status.activeSuit = e.target.id;
    setActiveSuitIcon();
    $('#select-suit').fadeOut();
    setTimeout(() => computerTurn(), 500);
  });
}

/* ================================================================================================
    GET ACTIVE SUIT ICON
================================================================================================ */

function setActiveSuitIcon() {
  let icon;
  if (status.activeSuit === 'Spades') {
    icon = '♠️';
  } else if (status.activeSuit === 'Hearts') {
    icon = '♥️';
  } else if (status.activeSuit === 'Diamonds') {
    icon = '♦️';
  } else if (status.activeSuit === 'Clubs') {
    icon = '♣️';
  }
  $('#active-suit').text(icon);
}

/* ================================================================================================
    CONTINUE WITH GAME
================================================================================================ */

$('#continue').on('click', e => {
  e.preventDefault();
  $('#game-over').fadeOut();
  $('#contents').empty().load('ajax/newgame.html', () => initializeGame());
});

initializeGame();