import { WorkspaceMember } from "../../models/WorkspaceMember.js";

export async function canViewWorkspace(userId, workspaceId) {
  const membership = await WorkspaceMember.findOne({ userId, workspaceId });
  return !!membership;
}

export async function canManageWorkspace(userId, workspaceId) {
  const membership = await WorkspaceMember.findOne({
    userId,
    workspaceId,
  });
  return membership && membership.role === "admin";
}

export async function isWorkspaceAdmin(userId, workspaceId) {
  const membership = await WorkspaceMember.findOne({
    userId,
    workspaceId,
  });
  return membership && membership.role === "admin";
}

export async function isWorkspaceMember(userId, workspaceId) {
  const membership = await WorkspaceMember.findOne({ userId, workspaceId });
  return !!membership;
}
