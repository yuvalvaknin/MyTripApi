import express from 'express';
import { createPost, updatePost, deletePost, findAll, getPostsByCountry, getPostsByUserName  } from './postHandlers';

const router = express.Router();

router.get('/', findAll);
router.post('/', createPost);
router.put('/', updatePost);
router.delete('/:postId', deletePost);
router.get('/byUserName/:userName', getPostsByUserName);
router.get('/byCountry/:country', getPostsByCountry);

export default router;