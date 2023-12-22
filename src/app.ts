import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import postRoutes from './api/posts/postRouter';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  MONGO_URI
} = process.env;
const app = express();
app.use(bodyParser.json());

app.use('/posts', postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connect(MONGO_URI || "Mac**bizona");
mongoose.connection.on('error', (error: Error) => console.log(error));