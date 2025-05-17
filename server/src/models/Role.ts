import mongoose, { Schema } from "mongoose";
import { IRole } from "../interfaces/auth";

const RoleSchema: Schema<IRole> = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'admin', 'user'
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
