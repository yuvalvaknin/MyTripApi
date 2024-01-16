import mongoose, { Document, Schema } from 'mongoose';

export interface Post extends Document {
  description: string;
  country: string;
  userName: string;
  photo: string | null;
}

const postSchema = new Schema({
  description: String,
  country: String,
  userName: {
    type: String, 
    ref: 'users',
    require: true,
  },
});

const PostModel = mongoose.model<Post>('Post', postSchema);

export default PostModel;