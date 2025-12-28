import { Board } from "../../models/Board.js";
import { WorkspaceMember } from "../../models/WorkspaceMember.js";
import { isMemberOfArray, isOwner } from "./helpers.js";
import { isWorkspaceMember } from "./workspace.js";

export async function canViewBoard(userId, boardId) {
  const board = await Board.findById(boardId);
  if (!board) return false;

  const hasWorkspaceAccess = board.workspaceId
    ? await isWorkspaceMember(userId, board.workspaceId)
    : false;

  return (
    isOwner(userId, board.owner.userId) ||
    isMemberOfArray(userId, board.members) ||
    hasWorkspaceAccess
  );
}

export async function canManageBoard(userId, boardId) {
  const board = await Board.findById(boardId);
  if (!board) return false;

  const hasWorkspaceAccess = board.workspaceId
    ? await isWorkspaceMember(userId, board.workspaceId)
    : false;

  return (
    isOwner(userId, board.owner.userId) ||
    isMemberOfArray(userId, board.members) ||
    hasWorkspaceAccess
  );
}

export async function canModifyBoardContent(userId, boardId) {
  const board = await Board.findById(boardId);
  if (!board) return false;

  const hasWorkspaceAccess = board.workspaceId
    ? await isWorkspaceMember(userId, board.workspaceId)
    : false;

  return (
    isOwner(userId, board.owner.userId) ||
    isMemberOfArray(userId, board.members) ||
    hasWorkspaceAccess
  );
}

export async function isBoardOwner(userId, boardId) {
  const board = await Board.findById(boardId);
  if (!board) return false;

  return isOwner(userId, board.owner.userId);
}
