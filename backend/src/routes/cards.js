import express from "express";
import {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
  moveCard,
  updateLabels,
  addComment,
  updateComment,
  deleteComment,
  getComments,
  addAssignee,
  removeAssignee,
  copyCard,
  updateCover,
  addAttachment,
  removeAttachment,
} from "../controllers/card-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { canModifyCard, canCreateCard } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  addCommentSchema,
  addAttachmentSchema,
  updateCoverSchema,
} from "../validation/schemas/card.js";
import { idParamSchema } from "../validation/schemas/common.js";

const router = express.Router();

router.get("/", getAllCards);
router.get("/:id", getCardById);
router.post(
  "/",
  validate({ body: createCardSchema }),
  authenticate,
  canCreateCard(),
  createCard
);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateCardSchema }),
  authenticate,
  canModifyCard(),
  updateCard
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  deleteCard
);
router.put(
  "/:id/move",
  validate({ params: idParamSchema, body: moveCardSchema }),
  authenticate,
  canModifyCard(),
  moveCard
);
router.put(
  "/:id/labels",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  updateLabels
);
router.put(
  "/:id/cover",
  validate({ params: idParamSchema, body: updateCoverSchema }),
  authenticate,
  canModifyCard(),
  updateCover
);
router.post(
  "/:id/attachments",
  validate({ params: idParamSchema, body: addAttachmentSchema }),
  authenticate,
  canModifyCard(),
  addAttachment
);
router.delete(
  "/:id/attachments/:attachmentId",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  removeAttachment
);
router.post(
  "/:id/comments",
  validate({ params: idParamSchema, body: addCommentSchema }),
  authenticate,
  canModifyCard(),
  addComment
);
router.put(
  "/:id/comments/:commentId",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  updateComment
);
router.delete(
  "/:id/comments/:commentId",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  deleteComment
);
router.get("/:id/comments", authenticate, getComments);

// router.get("/label/:labelId", getCardsByLabel);
// router.get("/assigned/:userId", getCardsByAssignedUser);

router.post(
  "/:id/assignees",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  addAssignee
);
router.delete(
  "/:id/assignees/:userId",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  removeAssignee
);

router.post(
  "/:id/copy",
  validate({ params: idParamSchema }),
  authenticate,
  canModifyCard(),
  copyCard
);

export default router;
