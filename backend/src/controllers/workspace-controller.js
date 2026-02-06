import * as workspaceService from "../services/workspace-service.js";
import { throwNotFound } from "../utils/error-utils.js";
import { sanitizeHTML, sanitizePlainText } from "../utils/sanitize.js";

export async function createWorkspace(req, res) {
  const { title, description } = req.body;
  const owner = {
    userId: req.currentUser._id,
    username: req.currentUser.username,
    fullname: req.currentUser.fullname,
  };
  const workspace = await workspaceService.createWorkspace({
    title: sanitizePlainText(title),
    description: description ? sanitizeHTML(description) : description,
    owner,
  });
  res.status(201).json({ workspace });
}

export async function getAllWorkspaces(_req, res) {
  const workspaces = await workspaceService.getAllWorkspaces();
  res.json({ workspaces });
}

export async function getWorkspaceById(req, res) {
  const workspace = await workspaceService.getWorkspaceById(req.params.id);
  if (!workspace) throwNotFound("Workspace");

  res.json({ workspace });
}

export async function updateWorkspace(req, res) {
  const { title, description } = req.body;
  const workspace = await workspaceService.updateWorkspace(req.params.id, {
    title: title ? sanitizePlainText(title) : title,
    description: description ? sanitizeHTML(description) : description,
  });
  if (!workspace) throwNotFound("Workspace");

  res.json({ workspace });
}

export async function deleteWorkspace(req, res) {
  const workspace = await workspaceService.deleteWorkspace(req.params.id);
  if (!workspace) throwNotFound("Workspace");

  res.status(204).send();
}

export async function getWorkspaceBoards(req, res) {
  const boards = await workspaceService.getWorkspaceBoards(req.params.id);
  res.json({ boards });
}

export async function addWorkspaceMember(req, res) {
  const { userId, username, fullname } = req.body;
  const member = await workspaceService.addMemberToWorkspace(req.params.id, {
    userId,
    username,
    fullname,
  });
  res.status(201).json({ member });
}

export async function removeWorkspaceMember(req, res) {
  const workspace = await workspaceService.removeMemberFromWorkspace(
    req.params.id,
    req.params.memberId
  );
  if (!workspace) throwNotFound("Workspace");

  res.status(204).send();
}
