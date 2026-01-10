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

const router = express.Router();

router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.get(
  "/:id/boards",
  authenticate,
  canManageWorkspace(),
  getWorkspaceBoards
);
router.post("/", authenticate, canCreateWorkspace(), createWorkspace);
router.put("/:id", authenticate, canManageWorkspace(), updateWorkspace);
router.delete("/:id", authenticate, canManageWorkspace(), deleteWorkspace);
router.post(
  "/:id/members",
  authenticate,
  canManageWorkspace(),
  addWorkspaceMember
);
router.delete(
  "/:id/members/:memberId",
  authenticate,
  canManageWorkspace(),
  removeWorkspaceMember
);

export default router;
