import mongoose, { Document, Schema, Types } from 'mongoose';

export interface Comment {
    commentContent: string;
    postId: string;
    userId: Types.ObjectId;
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
    userId: {
        type: Types.ObjectId, 
        ref: 'users',
        require: true
    }
});

const CommentModel = mongoose.model<Comment>('Comment', commentSchema);

export default CommentModel;