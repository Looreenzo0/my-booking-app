import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
}

const RoleSchema: Schema<IRole> = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'admin', 'user'
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
