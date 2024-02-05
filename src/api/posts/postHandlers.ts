import { Request, Response } from 'express';
import PostModel, { Post } from './post';
import createPostDto from './dtos/createPostDto'
import UpdatePostDto from './dtos/updatePostDto';
import returnPostDto from './dtos/returnPostDto';
import { addPhoto, attachPhoto, createPhotoDirectory, deletePhoto } from '../../utils/photoUtils';
import User, { IUser } from '../users/user';
import { Types } from 'mongoose';
import { WithUserId } from '../users/dtos/UserJwtPaylod';

const POST_PHOTO_DIRECTORY = createPhotoDirectory(__dirname);

const attachPhotoToPosts = (posts: Post[]): returnPostDto[] => {
  return posts.map((post) => 
    ({
      postId: post._id,
      description: post.description,
      country: post.country,
      userName: !post.userId ? 'Deleted User':(post.userId as unknown as IUser).userName,
      photo: attachPhoto(POST_PHOTO_DIRECTORY, post._id.toString())
    }))
}

export const findAll = async (req: Request, res: Response) => {
  console.log('Got final all posts request');
  try {
    const posts = await PostModel.find().populate('userId', 'userName');
    res.json(attachPhotoToPosts(posts));
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const createPost = async (req: Request, res: Response) => {
  console.log('Got create post request with the body:', req.body);
  try {
    const postData: WithUserId<createPostDto> = req.body;
    const newPost = await PostModel.create({
      country : postData.country,
      description : postData.description,
      userId : postData._userId
    });

    addPhoto(POST_PHOTO_DIRECTORY, newPost._id.toString(), postData.photo)
  
    res.json(newPost);

  } catch (error) {
    console.error('Got an error while creating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const updatePost = async (req: Request, res: Response) => {
  console.log('Got update post request with the body:', req.body);
  try {
    const updatedPostFields: UpdatePostDto = req.body;

    const updatedPost = await PostModel.findByIdAndUpdate(updatedPostFields.postId, updatedPostFields, { new: true });

    addPhoto(POST_PHOTO_DIRECTORY, updatedPost._id.toString(), updatedPostFields.photo)

    res.json(updatedPost);

  } catch (error) {
    console.error('Got an error while updating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const deletePost = async (req: Request, res: Response) => {
  console.log('Got delete post request on post with id:', req.params.postId);
  try {
    const postId = req.params.postId;

    await PostModel.findByIdAndDelete({_id: postId});

    deletePhoto(POST_PHOTO_DIRECTORY ,postId);

    res.status(204).end();

  } catch (error) {
    console.error('Got an error while deleting post:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const getPostsByCountry = async (req: Request, res: Response) => {
  console.log('Got request: get posts by country:', req.params.country);
  try {
    const countryName = req.params.country;
    const posts = await PostModel.find({country: countryName}).populate('userId', 'userName');

    res.json(attachPhotoToPosts(posts));
  } catch (error) {
    console.error('Got an error while fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
};


export const getPostsByUserName = async (req: Request, res: Response) => {
  console.info('Got request: get posts by user:', req.params.userName);
  
  try {
    const userName = req.params.userName;
    const user = await User.findOne({userName : userName});
    const posts :Post[] = await PostModel.find({userId: user._id}).populate('userId', 'userName');
    
    res.json(attachPhotoToPosts(posts));
  } catch (error) {
    console.error('Got an error while fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
};  