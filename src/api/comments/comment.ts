import mongoose, { Document, Schema } from 'mongoose';

export interface Comment extends Document {
    commentContent: string;
    postId: string;
    user: string;
}

const commentSchema = new Schema({
    commentContent: {
        type: String,
        require: true
    },
    postId: {
        type: String, 
        ref: 'posts',
        require: true
    },
    user: {
        type: String, 
        ref: 'users',
        require: true
    }
});

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);

export default CommentModel;