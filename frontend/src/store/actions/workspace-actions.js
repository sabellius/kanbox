import {
  SET_WORKSPACES,
  SET_WORKSPACE,
  ADD_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  ADD_MEMBER,
  REMOVE_MEMBER,
  SET_WORKSPACE_BOARDS,
  SET_LOADING,
  SET_ERROR,
} from "../reducers/workspace-reducer";

import { store } from "../store";
import { workspaceService } from "../../services/workspace-service";
import { createAsyncAction } from "../utils";

export const loadWorkspaces = createAsyncAction(
  SET_WORKSPACES,
  workspaceService.getAllWorkspaces,
  store
);

export const loadWorkspace = createAsyncAction(
  SET_WORKSPACE,
  workspaceService.getWorkspaceById,
  store
);

export const loadWorkspaceBoards = createAsyncAction(
  SET_WORKSPACE_BOARDS,
  workspaceService.getWorkspaceBoards,
  store
);

export const createWorkspace = createAsyncAction(
  ADD_WORKSPACE,
  workspaceService.createWorkspace,
  store
);

export const updateWorkspace = createAsyncAction(
  UPDATE_WORKSPACE,
  workspaceService.updateWorkspace,
  store
);

export const deleteWorkspace = createAsyncAction(
  DELETE_WORKSPACE,
  workspaceService.deleteWorkspace,
  store
);

export const addWorkspaceMember = createAsyncAction(
  ADD_MEMBER,
  workspaceService.addMember,
  store
);

export const removeWorkspaceMember = createAsyncAction(
  REMOVE_MEMBER,
  workspaceService.removeMember,
  store
);

export function setWorkspaces(workspaces) {
  return { type: SET_WORKSPACES, payload: workspaces };
}

export function setWorkspace(workspace) {
  return { type: SET_WORKSPACE, payload: workspace };
}

export function setLoading(key, isLoading) {
  return { type: SET_LOADING, payload: { key, isLoading } };
}

export function setError(key, error) {
  return { type: SET_ERROR, payload: { key, error } };
}
