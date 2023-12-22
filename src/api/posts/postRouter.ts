import express from 'express';
import { createPost, updatePost, deletePost, findAll } from './postHandlers';

const router = express.Router();

router.get('/', findAll);
router.post('/', createPost);
router.put('/', updatePost);
router.delete('/:postId', deletePost);

export default router;