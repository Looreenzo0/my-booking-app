import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { validationResult } from "express-validator";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, name, role } = req.body;
    const { user, token } = await authService.registerUser(
      username,
      email,
      password,
      name,
      role
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: (user.role as any).name || user.role,
      },
      token,
    });
  } catch (error: any) {
    if (
      error.message === "Email already registered" ||
      error.message === "Invalid role"
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return; // explicit return void
    }

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);

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
    return; // explicit return void
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await authService.getUsers();
    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    next(error);
  }
};
