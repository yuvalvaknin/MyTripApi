import { Request, Response } from 'express';
import CommentModel from './comment';

export const createComment = async (req: Request, res: Response) => {
    try {
        const newComment: Comment = req.body;
        const createdComment = await CommentModel.create(newComment);

        res.json(createdComment);
    } catch (error) {
    console.error('Got an error while creating comment:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const getCommentsNumberPerPost = async (req: Request, res: Response) => {
    try {
        const postId: string = req.params.postId;
        const commentsCounter: number = (await CommentModel.find({postId: postId})).length;
        
        res.json(commentsCounter);
    } catch (error) {
        console.error('Got an error while fetching comment:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const postId: string = req.params.postId;
        const comments: Comment[] = await CommentModel.find({postId: postId});

        res.json(comments);
    } catch (error) {
        console.error('Got an error while fetching comment:', error);
        res.status(500).send('Internal Server Error');
    }
}