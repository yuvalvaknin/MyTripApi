import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  userName: string;
  tokens : [string]
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  tokens: {
    type : [String]
  }

});

export default mongoose.model<IUser>("User", userSchema);
