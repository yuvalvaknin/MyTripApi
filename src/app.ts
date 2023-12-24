import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import postRoutes from './api/posts/postRouter';
import authRoutes from './api/users/AuthRoute'
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const {
  MONGO_URI
} = process.env;
const app = express();
app.use(bodyParser.json());

app.use(cors())

app.use('/posts', postRoutes);
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connect(MONGO_URI || "Mac**bizona");
mongoose.connection.on('error', (error: Error) => console.log(error));