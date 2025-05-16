import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import Role from "../models/Role";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = (user: IUser) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = {
    id: user._id,
    role:
      user.role instanceof mongoose.Types.ObjectId
        ? user.role
        : (user.role as any)._id,
  };

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role", "name");
    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password, name, role: roleName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const role = await Role.findOne({ name: roleName || "user" });
    if (!role) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const user = new User({
      username,
      email,
      password,
      name,
      role: role._id,
    });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: role.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("role", "name");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: (user.role as any).name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
