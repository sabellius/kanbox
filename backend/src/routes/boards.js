import express from "express";
import {
  createBoard,
  getAllBoards,
  getBoardById,
  getFullBoardById,
  updateBoard,
  deleteBoard,
  getBoardLabels,
  addBoardLabel,
  updateBoardLabel,
  deleteBoardLabel,
} from "../controllers/board-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { canManageBoard, canCreateBoard } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createBoardSchema,
  updateBoardSchema,
  createLabelSchema,
  updateLabelSchema,
} from "../validation/schemas/board.js";
import { idParamSchema } from "../validation/schemas/common.js";

const router = express.Router();

router.get("/", getAllBoards);
router.get("/:id", getBoardById);
router.get("/:id/full", getFullBoardById);
router.post(
  "/",
  validate({ body: createBoardSchema }),
  authenticate,
  canCreateBoard(),
  createBoard
);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateBoardSchema }),
  authenticate,
  canManageBoard(),
  updateBoard
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  authenticate,
  canManageBoard(),
  deleteBoard
);
router.get(
  "/:id/labels",
  validate({ params: idParamSchema }),
  authenticate,
  canManageBoard(),
  getBoardLabels
);
router.post(
  "/:id/labels",
  validate({ params: idParamSchema, body: createLabelSchema }),
  authenticate,
  canManageBoard(),
  addBoardLabel
);
router.put(
  "/:id/labels/:labelId",
  validate({ params: idParamSchema, body: updateLabelSchema }),
  authenticate,
  canManageBoard(),
  updateBoardLabel
);
router.delete(
  "/:id/labels/:labelId",
  validate({ params: idParamSchema }),
  authenticate,
  canManageBoard(),
  deleteBoardLabel
);
export default router;
