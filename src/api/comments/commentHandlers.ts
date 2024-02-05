import { Request, Response } from 'express';
import CommentModel, { Comment } from './comment';
import { WithUserId } from '../users/dtos/UserJwtPaylod';
import { IUser } from '../users/user';
import { returnCommentDto } from './dtos/returnCommentDto';

export const createComment = async (req: Request, res: Response) => {
    try {
        const newComment: WithUserId<Omit<Comment, 'userId'>> = req.body;
        const createdComment = await CommentModel.create({
            commentContent : newComment.commentContent,
            postId : newComment.postId,
            userId : newComment._userId
        });

        res.json(createdComment);
    } catch (error) {
    console.error('Got an error while creating comment:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const getCommentsNumberPerPost = async (req: Request, res: Response) => {
    try {
        const postId: string = req.params.postId;
        const commentsCounter: number = (await CommentModel.find({postId: postId})).length;
        
        res.json(commentsCounter);
    } catch (error) {
        console.error('Got an error while fetching comment:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const getCommentsByPost = async (req: Request, res: Response<returnCommentDto[] | string>) => {
    try {
        const postId: string = req.params.postId;
        const comments: Comment[] = await CommentModel.find({postId: postId}).populate('userId', 'userName');
        res.json(comments.map(com => ({
            commentContent : com.commentContent,
            postId : com.postId,
            userName : !com.userId ? 'Deleted User' :(com.userId as unknown as IUser).userName
        })));
    } catch (error) {
        console.error('Got an error while fetching comment:', error);
        res.status(500).send('Internal Server Error');
    }
};