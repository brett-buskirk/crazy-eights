/* ================================================================================================
    SET THE BASIC DRAGGABLE OPTIONS
================================================================================================ */

const dragOpt = {
  cursor: '-webkit-grab',
  opacity: 0.7,
  containment : [0, 0],
  snap: '#card-11',
  snapMode: 'inner',
  start: (e) => this.movingCard = e.target.id,
  revert: (e) => afterCardMoved(e),
  zIndex: 100,
  stop: (e, ui) => moveToTop(e, ui)
}

/* ================================================================================================
    PROCESS PLAYER MOVING A CARD
================================================================================================ */

function afterCardMoved(e) {
  if ($(e).attr('id') !== 'card-11') return true;
  let card = $(`#${this.movingCard}`).attr('data-card');
  let suit = (card.substr(0, 2) === '10') ? card[2] : card[1];
  let rank = (card.substr(0, 2) === '10') ? '10' : card[0];
  let upSuit = (status.upCard.shortName.substr(0, 2) === '10') 
    ? status.upCard.shortName[2] 
    : status.upCard.shortName[1];
  let upRank = (status.upCard.shortName.substr(0, 2) === '10') 
    ? '10' 
    : status.upCard.shortName[0];
  let sameRank = (rank === upRank);
  let sameSuit = (suit === upSuit);
  let eight = (rank === '8');
  if (status.upCard.rankId === 8) {
    if (suit !== status.activeSuit[0] && !eight) return true;
  } else {
    if (!sameRank && !sameSuit && !eight) return true;
  }
  $('#card-11').attr('data-card', card);
  $(`#${this.movingCard}`).remove();
  processPlayerMove(card);
}

/* ================================================================================================
    FIND THE HIGHEST Z-INDEX OF ALL THE CARDS
================================================================================================ */

function highestZIndex() {
  let highIndex = 0;
  $('.card').each(function() {
    let zIndex = $(this).css('z-index');
    if (zIndex !== 'auto') {
      zIndex = Number(zIndex);
      highIndex = (zIndex > highIndex) ? zIndex : highIndex;
    }
  });
  return highIndex + 1;
}

/* ================================================================================================
    SET THE MOVED CARD TO THE HIGEST Z-INDEX
================================================================================================ */

function moveToTop(e, ui) {
  const newZIndex = highestZIndex();
  $(`#${e.target.id}`).css('zIndex', newZIndex);
}