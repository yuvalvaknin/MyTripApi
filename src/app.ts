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
import { BiMap } from './bi-map';

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

let connectedSockets = new Map<string, Socket>();

let users = new BiMap<string, string>();

io.on('connection', (socket: Socket) => {
  console.log('new connection has been made');
  socket.on('new-user', (username) => {
    connectedSockets.set(socket.id, socket);
    users.set(socket.id, username);
    console.log(`${username} has connected`);
  });
  socket.on('send-message', (message) => {
    try {
      MessageModel.create(message);
    } catch (e) {
      console.error(e);
    }

    const socketId = users.getFromValue(message.toUser);
    if (socketId) {
      connectedSockets.get(socketId)?.emit('receive-message', message);
    }
    console.log('sending message: ', message);
  });
  socket.on('disconnect', () => {
    console.log(`${users.get(socket.id)} has disconnected`);
    connectedSockets.delete(socket.id);
    users.removeByKey(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
