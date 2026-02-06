import * as listService from "../services/list-service.js";
import createError from "http-errors";
import { throwNotFound } from "../utils/error-utils.js";
import { sanitizeHTML, sanitizePlainText } from "../utils/sanitize.js";

export async function createList(req, res) {
  const sanitizedData = {
    ...req.body,
    title: sanitizePlainText(req.body.title),
    description: req.body.description
      ? sanitizeHTML(req.body.description)
      : req.body.description,
  };
  const list = await listService.createList(sanitizedData);
  res.status(201).json({ list });
}

export async function getListById(req, res) {
  const list = await listService.getListById(req.params.id);
  if (!list) throwNotFound("List");

  res.status(200).json({ list });
}

export async function getListsByBoardId(req, res) {
  const { boardId } = req.query;
  if (!boardId) throw createError(400, "boardId is required");

  const lists = await listService.getListsByBoardId(boardId);
  res.status(200).json({ lists });
}

export async function updateList(req, res) {
  const sanitizedData = {
    ...req.body,
    title: req.body.title ? sanitizePlainText(req.body.title) : req.body.title,
    description: req.body.description
      ? sanitizeHTML(req.body.description)
      : req.body.description,
  };
  const list = await listService.updateList(req.params.id, sanitizedData);
  if (!list) throwNotFound("List");

  res.status(200).json({ list });
}

export async function moveList(req, res) {
  const { boardId, targetIndex } = req.body;
  const list = await listService.moveList(req.params.id, boardId, targetIndex);
  if (!list) throwNotFound("List");

  res.status(200).json({ list });
}

export async function archiveList(req, res) {
  const list = await listService.archiveList(req.params.id);
  if (!list) throwNotFound("List");

  res.status(200).json({ list });
}

export async function deleteList(req, res) {
  const deletedList = await listService.deleteList(req.params.id);
  if (!deletedList) throwNotFound("List");

  res.status(200).json({ id: deletedList._id });
}

export async function copyList(req, res) {
  const { id } = req.params;
  const copyOptions = req.body;
  const copiedList = await listService.copyList(id, copyOptions);
  res.status(201).json({ list: copiedList });
}
