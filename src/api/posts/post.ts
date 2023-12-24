import mongoose, { Document, Schema } from 'mongoose';

export interface Post extends Document {
  description: string;
  country: string;
  userName: string;
  comments: string[];
}

const postSchema = new Schema({
  description: String,
  country: String,
  userName: {
    type: Schema.Types.ObjectId, 
    ref: 'users',
    require: true
  },
  comments: [String],
});

const PostModel = mongoose.model<Post>('Post', postSchema);

export default PostModel;