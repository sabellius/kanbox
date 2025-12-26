export const selectCurrentBoard = state => state.boards.board;

export const selectBoardLists = state => {
  const boardId = state.boards.board?._id;
  if (!boardId) return [];
  return Object.values(state.boards.lists)
    .filter(list => list.boardId === boardId)
    .sort((a, b) => a.position.localeCompare(b.position));
};

export const selectCardsByListId = (state, listId) => {
  return Object.values(state.boards.cards)
    .filter(card => card.listId === listId)
    .sort((a, b) => a.position.localeCompare(b.position));
};

export const selectCardById = (state, cardId) => {
  return state.boards.cards[cardId];
};

export const selectListById = (state, listId) => {
  return state.boards.lists[listId];
};

export const selectAllCardsForBoard = state => {
  const boardId = state.boards.board?._id;
  if (!boardId) return [];
  const boardLists = Object.values(state.boards.lists).filter(
    list => list.boardId === boardId
  );
  const listIds = boardLists.map(list => list._id);
  return Object.values(state.boards.cards)
    .filter(card => listIds.includes(card.listId))
    .sort((a, b) => a.position.localeCompare(b.position));
};
