import { Workspace } from "../models/Workspace.js";
import { Board } from "../models/Board.js";

export async function createWorkspace(data) {
  return await Workspace.create(data);
}

export async function getAllWorkspaces() {
  return await Workspace.find();
}

export async function getWorkspaceById(id) {
  return await Workspace.findById(id);
}

export async function updateWorkspace(id, data) {
  return await Workspace.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteWorkspace(id) {
  return await Workspace.findByIdAndDelete(id);
}

export async function addMemberToWorkspace(workspaceId, memberData) {
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $push: { members: memberData } },
    { new: true, runValidators: true }
  );
  return workspace.members.at(-1);
}

export async function removeMemberFromWorkspace(workspaceId, memberId) {
  return await Workspace.findByIdAndUpdate(
    workspaceId,
    { $pull: { members: { userId: memberId } } },
    { new: true }
  );
}

export async function getWorkspaceBoards(workspaceId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");

  const boards = await Board.find({ workspaceId });
  return boards;
}
