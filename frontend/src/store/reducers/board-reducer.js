import { getDefaultFilter } from "../../services/filter-service";
import { createAsyncActionTypes, createAsyncHandlers } from "../utils";
import { sortByPosition } from "../../services/fractional-index-service";

export const SET_BOARDS = "SET_BOARDS";
export const SET_BOARD = createAsyncActionTypes("SET_BOARD");
export const DELETE_BOARD = "DELETE_BOARD";
export const ADD_BOARD = createAsyncActionTypes("ADD_BOARD");
export const UPDATE_BOARD = createAsyncActionTypes("UPDATE_BOARD");
export const ADD_LIST = createAsyncActionTypes("ADD_LIST");
export const MOVE_ALL_CARDS = createAsyncActionTypes("MOVE_ALL_CARDS");
export const ARCHIVE_LIST = createAsyncActionTypes("ARCHIVE_LIST");
export const UNARCHIVE_LIST = createAsyncActionTypes("UNARCHIVE_LIST");
export const ARCHIVE_ALL_CARDS_IN_LIST = createAsyncActionTypes(
  "ARCHIVE_ALL_CARDS_IN_LIST"
);
export const ADD_CARD = createAsyncActionTypes("ADD_CARD");
export const EDIT_CARD = createAsyncActionTypes("EDIT_CARD");
export const UPDATE_CARD_COVER = createAsyncActionTypes("UPDATE_CARD_COVER");
export const ADD_CARD_ATTACHMENT = createAsyncActionTypes(
  "ADD_CARD_ATTACHMENT"
);
export const REMOVE_CARD_ATTACHMENT = createAsyncActionTypes(
  "REMOVE_CARD_ATTACHMENT"
);
export const DELETE_CARD = createAsyncActionTypes("DELETE_CARD");
export const COPY_CARD = createAsyncActionTypes("COPY_CARD");
export const MOVE_CARD = createAsyncActionTypes("MOVE_CARD");
export const ADD_ASSIGNEE = createAsyncActionTypes("ADD_ASSIGNEE");
export const REMOVE_ASSIGNEE = createAsyncActionTypes("REMOVE_ASSIGNEE");
export const ADD_COMMENT = createAsyncActionTypes("ADD_COMMENT");
export const UPDATE_COMMENT = createAsyncActionTypes("UPDATE_COMMENT");
export const DELETE_COMMENT = createAsyncActionTypes("DELETE_COMMENT");
export const MOVE_LIST = createAsyncActionTypes("MOVE_LIST");
export const UPDATE_LIST = createAsyncActionTypes("UPDATE_LIST");
export const COPY_LIST = createAsyncActionTypes("COPY_LIST");
export const DELETE_LIST = createAsyncActionTypes("DELETE_LIST");
export const CREATE_LABEL = createAsyncActionTypes("CREATE_LABEL");
export const EDIT_LABEL = createAsyncActionTypes("EDIT_LABEL");
export const DELETE_LABEL = createAsyncActionTypes("DELETE_LABEL");
export const UPDATE_CARD_LABELS = createAsyncActionTypes("UPDATE_CARD_LABELS");

export const SET_LOADING = "boards/SET_LOADING";
export const SET_ERROR = "boards/SET_ERROR";
export const SET_FILTERS = "boards/SET_FILTERS";
export const CLEAR_ALL_FILTERS = "boards/CLEAR_ALL_FILTERS";

const initialState = {
  boards: [],
  board: null,
  lists: {},
  cards: {},
  loading: {},
  errors: {},
  filterBy: getDefaultFilter(),
};

const handlers = {
  ...createAsyncHandlers(ADD_LIST, ADD_LIST.KEY),
  [ADD_LIST.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [ADD_LIST.KEY]: false },
    lists: {
      ...state.lists,
      [action.payload._id]: action.payload,
    },
    board: {
      ...state.board,
      listIds: [...state.board.listIds, action.payload._id],
    },
  }),
  ...createAsyncHandlers(MOVE_ALL_CARDS, MOVE_ALL_CARDS.KEY),
  [MOVE_ALL_CARDS.SUCCESS]: (state, action) => {
    const updatedCards = action.payload.cards || [];
    const cardsUpdates = updatedCards.reduce((acc, card) => {
      acc[card._id] = card;
      return acc;
    }, {});

    return {
      ...state,
      loading: { ...state.loading, [MOVE_ALL_CARDS.KEY]: false },
      cards: {
        ...state.cards,
        ...cardsUpdates,
      },
    };
  },
  ...createAsyncHandlers(ARCHIVE_LIST, ARCHIVE_LIST.KEY),
  [ARCHIVE_LIST.SUCCESS]: (state, action) => {
    const { [action.payload._id]: _removed, ...remainingLists } = state.lists;
    return {
      ...state,
      loading: { ...state.loading, [ARCHIVE_LIST.KEY]: false },
      lists: remainingLists,
      board: {
        ...state.board,
        listIds: state.board.listIds.filter(
          listId => listId !== action.payload._id
        ),
      },
    };
  },
  ...createAsyncHandlers(UNARCHIVE_LIST, UNARCHIVE_LIST.KEY),
  [SET_BOARDS]: (state, action) => ({
    ...state,
    boards: action.payload,
  }),
  ...createAsyncHandlers(SET_BOARD, SET_BOARD.KEY),
  [SET_BOARD.SUCCESS]: (state, action) => {
    console.log("🚀 ~ action:", action);
    return {
      ...state,
      board: action.payload.board,
      lists: action.payload.lists.reduce((acc, list) => {
        acc[list._id] = list;
        return acc;
      }, {}),
      cards: action.payload.cards.reduce((acc, card) => {
        acc[card._id] = card;
        return acc;
      }, {}),
    };
  },
  [DELETE_BOARD]: (state, action) => {
    const boards = state.boards.filter(board => board._id !== action.payload);
    return { ...state, boards };
  },
  ...createAsyncHandlers(ADD_BOARD, ADD_BOARD.KEY),
  [ADD_BOARD.SUCCESS]: (state, action) => ({
    ...state,
    boards: [...state.boards, action.payload],
  }),
  ...createAsyncHandlers(UPDATE_BOARD, UPDATE_BOARD.KEY),
  [UPDATE_BOARD.SUCCESS]: (state, action) => ({
    ...state,
    board: { ...state.board, ...action.payload },
  }),
  ...createAsyncHandlers(MOVE_LIST, MOVE_LIST.KEY),
  [MOVE_LIST.SUCCESS]: (state, action) => {
    const movedList = action.payload;

    if (state.board._id !== movedList.boardId) {
      // List moved to a different board - remove from current board's listIds
      return {
        ...state,
        loading: { ...state.loading, [MOVE_LIST.KEY]: false },
        lists: {
          ...state.lists,
          [movedList._id]: movedList,
        },
        board: {
          ...state.board,
          listIds: state.board.listIds.filter(
            listId => listId !== movedList._id
          ),
        },
      };
    }

    // List moved within same board - update list and order listIds
    return {
      ...state,
      loading: { ...state.loading, [MOVE_LIST.KEY]: false },
      lists: {
        ...state.lists,
        [movedList._id]: movedList,
      },
      board: {
        ...state.board,
        listIds: sortByPosition(
          state.board.listIds
            .map(listId => state.lists[listId])
            .concat(movedList)
        ).map(list => list._id),
      },
    };
  },
  ...createAsyncHandlers(COPY_LIST, COPY_LIST.KEY),
  [COPY_LIST.SUCCESS]: (state, action) => {
    if (state.board._id !== action.payload.boardId) {
      // Copied to different board - return state unchanged
      return {
        ...state,
        loading: { ...state.loading, [COPY_LIST.KEY]: false },
      };
    }

    // Copied to same board - add to lists and listIds
    return {
      ...state,
      loading: { ...state.loading, [COPY_LIST.KEY]: false },
      lists: {
        ...state.lists,
        [action.payload._id]: action.payload,
      },
      board: {
        ...state.board,
        listIds: sortByPosition(
          state.board.listIds
            .map(listId => state.lists[listId])
            .concat(action.payload)
        ).map(list => list._id),
      },
    };
  },
  ...createAsyncHandlers(DELETE_LIST, DELETE_LIST.KEY),
  [DELETE_LIST.SUCCESS]: (state, action) => {
    const { [action.payload]: _removed, ...remainingLists } = state.lists;
    return {
      ...state,
      loading: { ...state.loading, [DELETE_LIST.KEY]: false },
      lists: remainingLists,
      board: {
        ...state.board,
        listIds: state.board.listIds.filter(
          listId => listId !== action.payload
        ),
      },
    };
  },
  ...createAsyncHandlers(UPDATE_LIST, UPDATE_LIST.KEY),
  [UPDATE_LIST.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [UPDATE_LIST.KEY]: false },
    lists: {
      ...state.lists,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(ADD_CARD, ADD_CARD.KEY),
  [ADD_CARD.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [ADD_CARD.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(EDIT_CARD, EDIT_CARD.KEY),
  [EDIT_CARD.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [EDIT_CARD.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),

  ...createAsyncHandlers(UPDATE_CARD_COVER, UPDATE_CARD_COVER.KEY),
  [UPDATE_CARD_COVER.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [UPDATE_CARD_COVER.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),

  ...createAsyncHandlers(ADD_CARD_ATTACHMENT, ADD_CARD_ATTACHMENT.KEY),
  [ADD_CARD_ATTACHMENT.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [ADD_CARD_ATTACHMENT.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),

  ...createAsyncHandlers(REMOVE_CARD_ATTACHMENT, REMOVE_CARD_ATTACHMENT.KEY),
  [REMOVE_CARD_ATTACHMENT.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [REMOVE_CARD_ATTACHMENT.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),

  ...createAsyncHandlers(DELETE_CARD, DELETE_CARD.KEY),
  [DELETE_CARD.SUCCESS]: (state, action) => {
    const { [action.payload.cardId]: _removed, ...remainingCards } =
      state.cards;
    return {
      ...state,
      loading: { ...state.loading, [DELETE_CARD.KEY]: false },
      cards: remainingCards,
    };
  },
  ...createAsyncHandlers(COPY_CARD, COPY_CARD.KEY),
  [COPY_CARD.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [COPY_CARD.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(MOVE_CARD, MOVE_CARD.KEY),
  [MOVE_CARD.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [MOVE_CARD.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(ADD_ASSIGNEE, ADD_ASSIGNEE.KEY),
  [ADD_ASSIGNEE.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [ADD_ASSIGNEE.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(REMOVE_ASSIGNEE, REMOVE_ASSIGNEE.KEY),
  [REMOVE_ASSIGNEE.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [REMOVE_ASSIGNEE.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(ADD_COMMENT, ADD_COMMENT.KEY),
  [ADD_COMMENT.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [ADD_COMMENT.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(UPDATE_COMMENT, UPDATE_COMMENT.KEY),
  [UPDATE_COMMENT.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [UPDATE_COMMENT.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(DELETE_COMMENT, DELETE_COMMENT.KEY),
  [DELETE_COMMENT.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [DELETE_COMMENT.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  ...createAsyncHandlers(CREATE_LABEL, CREATE_LABEL.KEY),
  [CREATE_LABEL.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [CREATE_LABEL.KEY]: false },
    board: {
      ...state.board,
      labels: [...state.board.labels, action.payload],
    },
  }),
  ...createAsyncHandlers(EDIT_LABEL, EDIT_LABEL.KEY),
  [EDIT_LABEL.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [EDIT_LABEL.KEY]: false },
    board: {
      ...state.board,
      labels: state.board.labels.map(l =>
        l._id === action.payload._id ? action.payload : l
      ),
    },
  }),
  ...createAsyncHandlers(DELETE_LABEL, DELETE_LABEL.KEY),
  [DELETE_LABEL.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [DELETE_LABEL.KEY]: false },
    board: {
      ...state.board,
      labels: state.board.labels.filter(l => l._id !== action.payload),
    },
    cards: Object.entries(state.cards).reduce((acc, [cardId, card]) => {
      acc[cardId] = {
        ...card,
        labelIds: card.labelIds.filter(id => id !== action.payload),
      };
      return acc;
    }, {}),
  }),
  ...createAsyncHandlers(UPDATE_CARD_LABELS, UPDATE_CARD_LABELS.KEY),
  [UPDATE_CARD_LABELS.SUCCESS]: (state, action) => ({
    ...state,
    loading: { ...state.loading, [UPDATE_CARD_LABELS.KEY]: false },
    cards: {
      ...state.cards,
      [action.payload._id]: action.payload,
    },
  }),
  [SET_LOADING]: (state, action) => ({
    ...state,
    loading: {
      ...state.loading,
      [action.payload.key]: action.payload.isLoading,
    },
  }),
  [SET_ERROR]: (state, action) => ({
    ...state,
    errors: {
      ...state.errors,
      [action.payload.key]: action.payload.error,
    },
  }),
  [SET_FILTERS]: (state, action) => ({
    ...state,
    filterBy: { ...state.filterBy, ...action.payload },
  }),
  [CLEAR_ALL_FILTERS]: state => ({
    ...state,
    filterBy: getDefaultFilter(),
  }),
};

export function boardReducer(state = initialState, action) {
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
}
