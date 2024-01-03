import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import postRoutes from './api/posts/postRouter';
import authRoutes from './api/users/AuthRoute';
import messageRoutes from './api/messages/messageRoute';
import commentRoutes from './api/comments/commentRoute';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import MessageModel from './api/messages/message';
import { log } from 'console';

dotenv.config();

const { MONGO_URI } = process.env;

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});



app.use(bodyParser.json());

app.use(cors());

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/comments', commentRoutes);

mongoose.connect(
  MONGO_URI ||
    'mongodb+srv://myTrip:myTrip@mytrip.pk6mcuz.mongodb.net/?retryWrites=true&w=majority',
);
mongoose.connection.on('error', (error: Error) => console.log(error));

let connectedUsers = new Map<string, Socket>();

io.on('connection', (socket: Socket) => {
  console.log('new connection has been made');
  socket.on('new-user', username => {
    connectedUsers.set(username, socket);
    console.log(`${username} has connected`);
  });
  socket.on('send-message', (message) => {
    try {
      MessageModel.create(message);
    } catch (e) {
      console.error(e);
    }
    connectedUsers.get(message.toUser)?.emit('receive-message', message);
    console.log('sending message: ', message);
  });
  socket.on('leave-chat', () => connectedUsers.delete(socket.id));
});



httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});