import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMember,
  getWorkspaceMembers,
  getWorkspaceBoards,
} from "../controllers/workspace-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  canViewWorkspace,
  canManageWorkspace,
  canCreateWorkspace,
} from "../middleware/authorize.js";

const router = express.Router();

router.get("/", getAllWorkspaces);
router.get("/user", authenticate, getUserWorkspaces);
router.get("/:id", authenticate, canViewWorkspace(), getWorkspaceById);
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
  "/:id/members/:userId",
  authenticate,
  canManageWorkspace(),
  removeWorkspaceMember
);
router.put(
  "/:id/members/:userId",
  authenticate,
  canManageWorkspace(),
  updateWorkspaceMember
);
router.get(
  "/:id/members",
  authenticate,
  canViewWorkspace(),
  getWorkspaceMembers
);
router.get("/:id/boards", authenticate, canViewWorkspace(), getWorkspaceBoards);

export default router;
