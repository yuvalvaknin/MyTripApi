import { Request, Response } from 'express';
import PostModel, { Post } from './post';
import createPostDto from './dtos/createPostDto'
import UpdatePostDto from './dtos/updatePostDto';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR_PATH = path.join(__dirname, 'photos');

if (!fs.existsSync(PHOTOS_DIR_PATH)) {
  fs.mkdirSync(PHOTOS_DIR_PATH);
}

export const findAll = async (req: Request, res: Response) => {
  console.log('Got final all posts request');
  try {
    const posts = await PostModel.find({});
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const createPost = async (req: Request, res: Response) => {
  console.log('Got create post request with the body:', req.body);
  try {
    const postData: createPostDto = req.body;
    const newPost = await PostModel.create(postData)

    const base64ImageData = postData.photo;

    const filePath = path.join(PHOTOS_DIR_PATH, newPost._id.toString());

    fs.writeFileSync(filePath, base64ImageData);
  
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

    if (updatedPostFields.photo) {
      const filePath = path.join(PHOTOS_DIR_PATH, updatedPostFields.postId.toString());
      fs.writeFileSync(filePath, updatedPostFields.photo);
    }

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

    const filePath = path.join(PHOTOS_DIR_PATH, postId.toString());

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
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
    const posts = await PostModel.find({country: countryName});

    res.json(posts);
  } catch (error) {
    console.error('Got an error while fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const getPostsByUserName = async (req: Request, res: Response) => {
  console.log('Got request: get posts by user:', req.params.userName);
  try {
    const userName = req.params.userName;
    const posts = await PostModel.find({userName: userName});

    res.json(posts);
  } catch (error) {
    console.error('Got an error while fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
}