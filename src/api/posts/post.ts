import mongoose, { Document, Schema, Types } from 'mongoose';

export interface Post extends Document {
  description: string;
  country: string;
  userId: Types.ObjectId;
  photo: string | null;
}

const postSchema = new Schema({
  description: String,
  country: String,
  userId: {
    type: Types.ObjectId, 
    ref: 'users',
    require: true,
  },
});

const PostModel = mongoose.model<Post>('Post', postSchema);

export default PostModel;