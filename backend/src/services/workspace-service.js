import { Workspace } from "../models/Workspace.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { Board } from "../models/Board.js";

export async function createWorkspace(data, ownerId) {
  return await Workspace.create({
    name: data.name,
    description: data.description || "",
    ownerId,
    visibility: data.visibility || "private",
  });
}

export async function getAllWorkspaces() {
  return await Workspace.find();
}

export async function getWorkspaceById(id) {
  return await Workspace.findById(id);
}

export async function getUserWorkspaces(userId) {
  const memberships = await WorkspaceMember.find({ userId })
    .populate("workspaceId")
    .lean();

  return memberships.map(m => ({
    ...m.workspaceId,
    role: m.role,
    createdAt: m.createdAt,
  }));
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

export async function addMemberToWorkspace(
  workspaceId,
  userId,
  role = "member"
) {
  return await WorkspaceMember.create({
    workspaceId,
    userId,
    role,
  });
}

export async function removeMemberFromWorkspace(workspaceId, userId) {
  return await WorkspaceMember.deleteOne({ workspaceId, userId });
}

export async function updateMemberRole(workspaceId, userId, role) {
  return await WorkspaceMember.findOneAndUpdate(
    { workspaceId, userId },
    { role },
    { new: true, runValidators: true }
  );
}

export async function getWorkspaceMembers(workspaceId) {
  return await WorkspaceMember.find({ workspaceId }).populate("userId").lean();
}

export async function getWorkspaceBoards(workspaceId) {
  return await Board.find({ workspaceId });
}
