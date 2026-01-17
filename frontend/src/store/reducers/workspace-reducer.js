import { createAsyncActionTypes, createAsyncHandlers } from "../utils";

export const SET_WORKSPACES = createAsyncActionTypes("SET_WORKSPACES");
export const SET_WORKSPACE = createAsyncActionTypes("SET_WORKSPACE");
export const ADD_WORKSPACE = createAsyncActionTypes("ADD_WORKSPACE");
export const UPDATE_WORKSPACE = createAsyncActionTypes("UPDATE_WORKSPACE");
export const DELETE_WORKSPACE = createAsyncActionTypes("DELETE_WORKSPACE");
export const ADD_MEMBER = createAsyncActionTypes("ADD_MEMBER");
export const REMOVE_MEMBER = createAsyncActionTypes("REMOVE_MEMBER");
export const SET_WORKSPACE_BOARDS = createAsyncActionTypes(
  "SET_WORKSPACE_BOARDS"
);

export const SET_LOADING = "workspaces/SET_LOADING";
export const SET_ERROR = "workspaces/SET_ERROR";

const initialState = {
  workspaces: [],
  workspace: null,
  workspaceBoards: [],
  loading: {},
  errors: {},
};

const handlers = {
  ...createAsyncHandlers(SET_WORKSPACES, SET_WORKSPACES.KEY),
  [SET_WORKSPACES.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: action.payload,
  }),

  ...createAsyncHandlers(SET_WORKSPACE, SET_WORKSPACE.KEY),
  [SET_WORKSPACE.SUCCESS]: (state, action) => ({
    ...state,
    workspace: action.payload,
  }),

  ...createAsyncHandlers(ADD_WORKSPACE, ADD_WORKSPACE.KEY),
  [ADD_WORKSPACE.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: [...state.workspaces, action.payload],
  }),

  ...createAsyncHandlers(UPDATE_WORKSPACE, UPDATE_WORKSPACE.KEY),
  [UPDATE_WORKSPACE.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: state.workspaces.map(ws =>
      ws._id === action.payload._id ? action.payload : ws
    ),
    workspace:
      state.workspace?._id === action.payload._id
        ? action.payload
        : state.workspace,
  }),

  ...createAsyncHandlers(DELETE_WORKSPACE, DELETE_WORKSPACE.KEY),
  [DELETE_WORKSPACE.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: state.workspaces.filter(ws => ws._id !== action.payload),
    workspace: state.workspace?._id === action.payload ? null : state.workspace,
  }),

  ...createAsyncHandlers(ADD_MEMBER, ADD_MEMBER.KEY),
  [ADD_MEMBER.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: state.workspaces.map(ws =>
      ws._id === action.payload.workspaceId
        ? { ...ws, members: [...ws.members, action.payload.member] }
        : ws
    ),
    workspace:
      state.workspace?._id === action.payload.workspaceId
        ? {
            ...state.workspace,
            members: [...state.workspace.members, action.payload.member],
          }
        : state.workspace,
  }),

  ...createAsyncHandlers(REMOVE_MEMBER, REMOVE_MEMBER.KEY),
  [REMOVE_MEMBER.SUCCESS]: (state, action) => ({
    ...state,
    workspaces: state.workspaces.map(ws =>
      ws._id === action.payload.workspaceId
        ? {
            ...ws,
            members: ws.members.filter(
              m => m.userId !== action.payload.memberId
            ),
          }
        : ws
    ),
    workspace:
      state.workspace?._id === action.payload.workspaceId
        ? {
            ...state.workspace,
            members: state.workspace.members.filter(
              m => m.userId !== action.payload.memberId
            ),
          }
        : state.workspace,
  }),

  ...createAsyncHandlers(SET_WORKSPACE_BOARDS, SET_WORKSPACE_BOARDS.KEY),
  [SET_WORKSPACE_BOARDS.SUCCESS]: (state, action) => ({
    ...state,
    workspaceBoards: action.payload,
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
};

export function workspaceReducer(state = initialState, action) {
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
}
