export function selectWorkspaces(state) {
  return state.workspaces.workspaces;
}

export function selectWorkspace(state) {
  return state.workspaces.workspace;
}

export function selectWorkspaceBoards(state) {
  return state.workspaces.workspaceBoards;
}

export function selectWorkspaceLoading(state) {
  return state.workspaces.loading;
}

export function selectWorkspaceErrors(state) {
  return state.workspaces.errors;
}

export function selectWorkspaceById(state, workspaceId) {
  return state.workspaces.workspaces.find(
    workspace => workspace._id === workspaceId
  );
}

export function selectOwnedWorkspaces(state, userId) {
  return state.workspaces.workspaces.filter(
    workspace => workspace.ownerId === userId
  );
}

export function selectMemberWorkspaces(state, userId) {
  return state.workspaces.workspaces.filter(workspace =>
    workspace.members.some(member => member.userId === userId)
  );
}

export function selectAccessibleWorkspaces(state, userId) {
  return state.workspaces.workspaces.filter(
    workspace =>
      workspace.ownerId === userId ||
      workspace.members.some(m => m.userId === userId)
  );
}

export function selectIsWorkspaceOwner(state, workspaceId, userId) {
  const workspace = state.workspaces.workspaces.find(
    workspace => workspace._id === workspaceId
  );
  return workspace?.ownerId === userId;
}

export function selectIsWorkspaceMember(state, workspaceId, userId) {
  const workspace = state.workspaces.workspaces.find(
    workspace => workspace._id === workspaceId
  );
  return workspace?.members.some(member => member.userId === userId);
}

export function selectIsLoading(state, key) {
  return state.workspaces.loading[key] || false;
}

export function selectError(state, key) {
  return state.workspaces.errors[key] || null;
}
