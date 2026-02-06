import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { throwNotFound } from "../utils/error-utils.js";
import { config } from "../config/index.js";

export async function signup(req, res) {
  const { email, username, fullname, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) throw createError(409, "User already exists");

  const user = await User.create({
    email,
    username,
    fullname,
    password,
  });
  const token = jwt.sign({ userId: user._id }, config.auth.jwt.secret, {
    expiresIn: config.auth.jwt.expiresIn,
  });
  res.cookie("token", token, config.auth.cookie);
  res.status(201).json({ user: user.getSafeUser() });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throwNotFound("User");

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) throw createError(401, "Invalid credentials");

  const token = jwt.sign({ userId: user._id }, config.auth.jwt.secret, {
    expiresIn: config.auth.jwt.expiresIn,
  });
  res.cookie("token", token, config.auth.cookie);
  res.json({ user: user.getSafeUser() });
}

export function logout(_req, res) {
  res.clearCookie("token");
  res.status(204).send();
}

export async function getCurrentUser(req, res) {
  const token = req.cookies.token;
  if (!token) throw createError(401, "Invalid credentials");

  const decoded = jwt.verify(token, config.auth.jwt.secret);
  const user = await User.findById(decoded.userId);
  if (!user) throwNotFound("User");

  res.json({ user: user.getSafeUser() });
}
