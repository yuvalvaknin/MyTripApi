import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  userName: string;
  tokens : string[]
  isGoogleLogin : boolean; 
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
  },
  tokens: {
    type : [String]
  }, 
  isGoogleLogin: { 
    type : Boolean 
  }

});

export default mongoose.model<IUser>("User", userSchema);