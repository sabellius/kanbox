import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth-controller.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validation/schemas/auth.js";

const router = express.Router();

router.post("/signup", validate({ body: signupSchema }), signup);
router.post("/login", validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/session", getCurrentUser);

export default router;
