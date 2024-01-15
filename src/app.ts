import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import postRoutes from './api/posts/postRouter';
import authRoutes from './api/users/AuthRoute';
import messageRoutes from './api/messages/messageRoute';
import commentRoutes from './api/comments/commentRoute';
import * as dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const {
  MONGO_URI,
  FRONT_PATH
} = process.env;
const app = express();
app.use(cors({
  origin : FRONT_PATH,
  credentials : true
}));

app.options('*', cors());

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/comments', commentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connect(MONGO_URI || "Mac**bizona");
mongoose.connection.on('error', (error: Error) => console.log(error));