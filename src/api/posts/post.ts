import mongoose, { Document, Schema } from 'mongoose';

interface Post extends Document {
  description: string;
  country: string;
  userName: string;
  comments: string[];
}

const postSchema = new Schema({
  description: String,
  country: String,
  userName: String,
  comments: [String],
});

const PostModel = mongoose.model<Post>('Post', postSchema);

export default PostModel;