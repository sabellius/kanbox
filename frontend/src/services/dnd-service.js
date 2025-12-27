/**
 * Reorders cards within lists based on drag and drop operation
 * @param {Object} cards - Normalized cards object { [cardId]: card }
 * @param {string} sourceDroppableId - ID of the source list
 * @param {string} destinationDroppableId - ID of the destination list
 * @param {number} sourceIndex - Index of the card in the source list
 * @param {number} destinationIndex - Index where the card should be placed in the destination list
 * @param {string} draggableId - ID of the card being moved
 * @returns {Object} Object containing the card being moved
 */
export function reorderCards(
  cards,
  sourceDroppableId,
  destinationDroppableId,
  sourceIndex,
  destinationIndex,
  draggableId
) {
  const cardToMove = cards[draggableId];

  if (!cardToMove) {
    throw new Error("Card not found");
  }

  return { cardToMove };
}

/**
 * Reorders lists within a board based on drag and drop operation
 * @param {Array} lists - Array of list objects
 * @param {number} sourceIndex - Index of the list being moved
 * @param {number} destinationIndex - Index where the list should be placed
 * @returns {Object} Object containing the new lists array and the list that was moved
 */
export function reorderLists(lists, sourceIndex, destinationIndex) {
  if (
    sourceIndex < 0 ||
    sourceIndex >= lists.length ||
    destinationIndex < 0 ||
    destinationIndex >= lists.length
  ) {
    throw new Error("Invalid source or destination index");
  }

  const newLists = Array.from(lists);
  const [listToMove] = newLists.splice(sourceIndex, 1);
  newLists.splice(destinationIndex, 0, listToMove);

  const before = newLists[destinationIndex - 1]?._id || null;
  const after = newLists[destinationIndex + 1]?._id || null;

  return { newLists, listToMove, before, after };
}
