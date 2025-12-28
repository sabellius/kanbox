import * as workspaceService from "../services/workspace-service.js";
import createError from "http-errors";

export async function createWorkspace(req, res) {
  const { name, description, visibility } = req.body;
  const workspace = await workspaceService.createWorkspace(
    {
      name,
      description,
      visibility,
    },
    req.currentUser._id
  );

  await workspaceService.addMemberToWorkspace(
    workspace._id,
    req.currentUser._id,
    "admin"
  );

  res.status(201).json({ workspace });
}

export async function getAllWorkspaces(_req, res) {
  const workspaces = await workspaceService.getAllWorkspaces();
  res.json({ workspaces });
}

export async function getWorkspaceById(req, res) {
  const workspace = await workspaceService.getWorkspaceById(req.params.id);
  if (!workspace) throw createError(404, "Workspace not found");

  res.json({ workspace });
}

export async function getUserWorkspaces(req, res) {
  const workspaces = await workspaceService.getUserWorkspaces(
    req.currentUser._id
  );
  res.json({ workspaces });
}

export async function updateWorkspace(req, res) {
  const { name, description, visibility } = req.body;
  const workspace = await workspaceService.updateWorkspace(req.params.id, {
    name,
    description,
    visibility,
  });
  if (!workspace) throw createError(404, "Workspace not found");

  res.json({ workspace });
}

export async function deleteWorkspace(req, res) {
  const workspace = await workspaceService.deleteWorkspace(req.params.id);
  if (!workspace) throw createError(404, "Workspace not found");

  res.status(204).send();
}

export async function addWorkspaceMember(req, res) {
  const { userId, role } = req.body;
  const member = await workspaceService.addMemberToWorkspace(
    req.params.id,
    userId,
    role
  );
  res.status(201).json({ member });
}

export async function removeWorkspaceMember(req, res) {
  const member = await workspaceService.removeMemberFromWorkspace(
    req.params.id,
    req.params.userId
  );
  if (!member) throw createError(404, "Member not found");

  res.status(204).send();
}

export async function updateWorkspaceMember(req, res) {
  const { role } = req.body;
  const member = await workspaceService.updateMemberRole(
    req.params.id,
    req.params.userId,
    role
  );
  if (!member) throw createError(404, "Member not found");

  res.json({ member });
}

export async function getWorkspaceMembers(req, res) {
  const members = await workspaceService.getWorkspaceMembers(req.params.id);
  res.json({ members });
}

export async function getWorkspaceBoards(req, res) {
  const boards = await workspaceService.getWorkspaceBoards(req.params.id);
  res.json({ boards });
}
