import { Board } from "../models/Board.js";
import { List } from "../models/List.js";
import { Card } from "../models/Card.js";
import {
  validateFilterParams,
  buildCardFilterQuery,
} from "./filter-service.js";

export async function createBoard(data) {
  if (data.appearance) {
    const { background } = data.appearance;
    data.appearance = { background };
  }

  return await Board.create(data);
}

export async function getAllBoards() {
  return await Board.find();
}

export async function getBoardById(id) {
  return await Board.findById(id);
}

export async function getFullBoardById(id, filterBy = {}) {
  const validatedFilters = validateFilterParams(filterBy);
  const hasFilters = Object.keys(validatedFilters).length > 0;

  const board = await Board.findById(id);
  if (!board) return null;

  const lists = await List.find({ boardId: id }).sort({ position: 1 });

  const listIds = lists.map(list => list._id);
  let cards;
  if (!hasFilters) {
    cards = await Card.find({ listId: { $in: listIds } }).sort({
      position: 1,
    });
  } else {
    cards = await Card.find({
      listId: { $in: listIds },
      ...buildCardFilterQuery(validatedFilters),
    }).sort({ position: 1 });
  }

  return {
    board,
    lists,
    cards,
  };
}

export async function updateBoard(id, data) {
  if (data.appearance) {
    const { background } = data.appearance;
    data.appearance = { background };
  }

  return await Board.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteBoard(id) {
  return await Board.findByIdAndDelete(id);
}

export async function getBoardLabels(boardId) {
  const board = await Board.findById(boardId);
  if (!board) throw new Error("Board not found");
  return board;
}

export async function addLabelToBoard(boardId, labelData) {
  const board = await Board.findByIdAndUpdate(
    boardId,
    { $push: { labels: labelData } },
    { new: true, runValidators: true }
  );
  return board.labels.at(-1);
}

export async function updateLabelInBoard(boardId, labelId, labelData) {
  const board = await Board.findOneAndUpdate(
    { _id: boardId, "labels._id": labelId },
    {
      $set: {
        "labels.$.title": labelData.title,
        "labels.$.color": labelData.color,
      },
    },
    { new: true, runValidators: true }
  );
  return board.labels.id(labelId);
}

export async function removeLabelFromBoard(boardId, labelId) {
  return await Board.findByIdAndUpdate(
    boardId,
    { $pull: { labels: { _id: labelId } } },
    { new: true }
  );
}
