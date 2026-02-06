import express from "express";
import {
  createList,
  getListById,
  getListsByBoardId,
  updateList,
  moveList,
  archiveList,
  deleteList,
  copyList,
} from "../controllers/list-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { canModifyList, canCreateList } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createListSchema,
  updateListSchema,
  moveListSchema,
  copyListSchema,
} from "../validation/schemas/list.js";
import { idParamSchema } from "../validation/schemas/common.js";

const router = express.Router();

router.get("/", getListsByBoardId);
router.get("/:id", getListById);
router.post(
  "/",
  validate({ body: createListSchema }),
  authenticate,
  canCreateList(),
  createList
);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateListSchema }),
  authenticate,
  canModifyList(),
  updateList
);
router.put(
  "/:id/move",
  validate({ params: idParamSchema, body: moveListSchema }),
  authenticate,
  canModifyList(),
  moveList
);
router.put(
  "/:id/archive",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyList(),
  archiveList
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyList(),
  deleteList
);
router.post(
  "/:id/copy",
  validate({ params: idParamSchema, body: copyListSchema }),
  authenticate,
  canModifyList(),
  copyList
);

export default router;
