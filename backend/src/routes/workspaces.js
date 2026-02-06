import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceBoards,
  addWorkspaceMember,
  removeWorkspaceMember,
} from "../controllers/workspace-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  canManageWorkspace,
  canCreateWorkspace,
} from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
} from "../validation/schemas/workspace.js";
import { idParamSchema } from "../validation/schemas/common.js";

const router = express.Router();

router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.get(
  "/:id/boards",
  authenticate,
  canManageWorkspace(),
  getWorkspaceBoards
);
router.post(
  "/",
  validate({ body: createWorkspaceSchema }),
  authenticate,
  canCreateWorkspace(),
  createWorkspace
);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateWorkspaceSchema }),
  authenticate,
  canManageWorkspace(),
  updateWorkspace
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  authenticate,
  canManageWorkspace(),
  deleteWorkspace
);
router.post(
  "/:id/members",
  validate({ params: idParamSchema, body: addMemberSchema }),
  authenticate,
  canManageWorkspace(),
  addWorkspaceMember
);
router.delete(
  "/:id/members/:memberId",
  validate({ params: idParamSchema }),
  authenticate,
  canManageWorkspace(),
  removeWorkspaceMember
);

export default router;
