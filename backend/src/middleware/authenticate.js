import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import createError from "http-errors";
import { config } from "../config/index.js";

export async function authenticate(req, _res, next) {
  const token = req.cookies.token;
  if (!token) throw createError(401, "Unauthorized");

  const decoded = jwt.verify(token, config.auth.jwt.secret);
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) throw createError(401, "Unauthorized");

  req.currentUser = currentUser;
  next();
}
