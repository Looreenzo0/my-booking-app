import User from "../models/User";
import Role from "../models/Role";
import { IUser } from "../interfaces/auth";
import { AppError } from "../utils/appError";
import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) throw new AppError("JWT_SECRET is not defined", 500);

  // Extract role name string from populated role or fallback
  const roleName =
    typeof user.role === "object" && "name" in user.role
      ? (user.role as any).name
      : user.role;

  const payload = {
    id: user._id,
    role: roleName,
  };

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  name: string,
  roleName: string = "user"
): Promise<{ user: IUser; token: string }> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email already registered", 409);

  const role = await Role.findOne({ name: roleName });
  if (!role) throw new AppError("Invalid role", 400);

  const user = new User({
    username,
    email,
    password,
    name,
    role: role._id,
  });

  await user.save();

  const token = generateToken(user);

  return { user, token };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email }).populate("role", "name");
  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const token = generateToken(user);

  return { user, token };
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select("-password").populate("role", "name");
};

export const getUsers = async (): Promise<IUser[]> => {
  return User.find().select("-password").populate("role", "name");
};
