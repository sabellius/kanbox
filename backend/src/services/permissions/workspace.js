import { Workspace } from "../../models/Workspace.js";
import { isMemberOfArray, isOwner } from "./helpers.js";

export async function canManageWorkspace(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return false;

  return (
    isOwner(userId, workspace.owner.userId) ||
    isMemberOfArray(userId, workspace.members)
  );
}
