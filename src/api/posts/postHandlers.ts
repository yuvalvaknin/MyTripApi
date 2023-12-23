import { Request, Response } from 'express';
import PostModel from './post';
import createPostDto from './dtos/createPostDto'
import updatePostDto from './dtos/updatePostDto';

export const findAll = async (req: Request, res: Response) => {
  console.log('got finalAll request');
  try {
    const posts = await PostModel.find({});
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const createPost = async (req: Request, res: Response) => {
  console.log('got createPost request with the body:', req.body);
  try {
    const postData: createPostDto = req.body;
    const newPost = await PostModel.create(postData)

    res.json(newPost);

  } catch (error) {
    console.error('Got an error while creating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const updatePost = async (req: Request, res: Response) => {
  console.log('got updatePost request with the body:', req.body);
  try {
    const updatedPostFields: updatePostDto = req.body;

    const updatedPost = await PostModel.findByIdAndUpdate(updatedPostFields.postId, updatedPostFields, { new: true });

    res.json(updatedPost);

  } catch (error) {
    console.error('Got an error while updating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const deletePost = async (req: Request, res: Response) => {
  console.log('got deletePost request on post with id:', req.params.postId);
  try {
    const postId = req.params.postId;

    await PostModel.findByIdAndDelete({_id: postId});
    res.status(204).end();

  } catch (error) {
    console.error('Got an error while deleting post:', error);
    res.status(500).send('Internal Server Error');
  }
};
