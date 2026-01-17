import { httpService } from "./http-service";

export const workspaceService = {
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceBoards,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
};

async function getAllWorkspaces() {
  const data = await httpService.get("workspaces");
  return data.workspaces;
}

async function getWorkspaceById(id) {
  const data = await httpService.get(`workspaces/${id}`);
  return data.workspace;
}

async function getWorkspaceBoards(id) {
  const data = await httpService.get(`workspaces/${id}/boards`);
  return data.boards;
}

async function createWorkspace(workspaceData) {
  const data = await httpService.post("workspaces", workspaceData);
  return data.workspace;
}

async function updateWorkspace(id, updates) {
  const data = await httpService.put(`workspaces/${id}`, updates);
  return data.workspace;
}

async function deleteWorkspace(id) {
  await httpService.delete(`workspaces/${id}`);
  return id;
}

async function addMember(workspaceId, memberData) {
  const data = await httpService.post(
    `workspaces/${workspaceId}/members`,
    memberData
  );
  return data.member;
}

async function removeMember(workspaceId, memberId) {
  await httpService.delete(`workspaces/${workspaceId}/members/${memberId}`);
  return memberId;
}
