import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  role: Types.ObjectId | IRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IRole extends Document {
  name: string;
  description?: string;
}
