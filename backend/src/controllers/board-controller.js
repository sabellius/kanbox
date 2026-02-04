import * as boardService from "../services/board-service.js";
import createError from "http-errors";
import { throwNotFound } from "../utils/error-utils.js";

export async function createBoard(req, res) {
  const { title, description, appearance, workspaceId } = req.body;
  const owner = {
    userId: req.currentUser._id,
    username: req.currentUser.username,
    fullname: req.currentUser.fullname,
  };
  const board = await boardService.createBoard({
    title,
    description,
    owner,
    appearance,
    workspaceId,
  });
  res.status(201).json({ board });
}

export async function getAllBoards(_req, res) {
  const boards = await boardService.getAllBoards();
  res.json({ boards });
}

export async function getBoardById(req, res) {
  const board = await boardService.getBoardById(req.params.id);
  if (!board) throwNotFound("Board");

  res.json({ board });
}

export async function getFullBoardById(req, res) {
  const { title, labels, members, noMembers, includeNoLabels } = req.query;

  const filterBy = {
    title,
    labels: labels
      ? labels
          .split(",")
          .map(id => id.trim())
          .filter(id => id)
      : undefined,
    members: members
      ? members
          .split(",")
          .map(id => id.trim())
          .filter(id => id)
      : undefined,
    noMembers: noMembers === "true" || noMembers === "1",
    includeNoLabels: includeNoLabels === "true" || includeNoLabels === "1",
  };

  const fullBoard = await boardService.getFullBoardById(
    req.params.id,
    filterBy
  );
  if (!fullBoard) throwNotFound("Board");

  res.json(fullBoard);
}

export async function updateBoard(req, res) {
  const { title, description, owner, appearance } = req.body;
  const board = await boardService.updateBoard(req.params.id, {
    title,
    description,
    owner,
    appearance,
  });
  if (!board) throwNotFound("Board");

  res.json({ board });
}

export async function deleteBoard(req, res) {
  const board = await boardService.deleteBoard(req.params.id);
  if (!board) throwNotFound("Board");

  res.status(204).send();
}

export async function getBoardLabels(req, res) {
  const board = await boardService.getBoardLabels(req.params.id);
  if (!board) throwNotFound("Board");

  res.json({ labels: board.labels });
}

export async function addBoardLabel(req, res) {
  const { title, color } = req.body;
  const label = await boardService.addLabelToBoard(req.params.id, {
    title,
    color,
  });
  if (!label) throwNotFound("Board");

  res.status(201).json({ label });
}

export async function updateBoardLabel(req, res) {
  const { title, color } = req.body;
  const updatedLabel = await boardService.updateLabelInBoard(
    req.params.id,
    req.params.labelId,
    { title, color }
  );
  if (!updatedLabel) throwNotFound("Label");

  res.json({ label: updatedLabel });
}

export async function deleteBoardLabel(req, res) {
  const board = await boardService.removeLabelFromBoard(
    req.params.id,
    req.params.labelId
  );
  if (!board) throwNotFound("Label");

  res.status(204).send();
}
