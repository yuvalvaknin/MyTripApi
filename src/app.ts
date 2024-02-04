import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import postRoutes from './api/posts/postRouter';
import authRoutes from './api/users/AuthRoute';
import userRoutes from './api/users/UserRoute'
import messageRoutes from './api/messages/messageRoute';
import commentRoutes from './api/comments/commentRoute';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import MessageModel from './api/messages/message';
import { BiMap } from './bi-map';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import User from './api/users/user';
import https from 'https';
import fs from 'fs';


dotenv.config();

const { MONGO_URI, FRONT_PATH } = process.env;

const PORT = (process.env.NODE_ENV === 'production' ? process.env.HTTPS_PORT : process.env.PORT) || 3000;

const app = express();

let server;

if (process.env.NODE_ENV !== 'production') {
  console.log('development');
  server = createServer(app);
} else {
  console.log('PRODUCTION');
  const options2 = {
    key: fs.readFileSync('../client-key.pem'),
    cert: fs.readFileSync('../client-cert.pem')
  };
  server = https.createServer(options2, app);
}

const io = new Server(server, {
  cors: {
    origin: FRONT_PATH,
    methods: ['GET', 'POST'],
  },
});

app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb'}));

app.use(cors({
  origin : FRONT_PATH,
  credentials : true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);
app.use('/comments', commentRoutes);

mongoose.connect(
  MONGO_URI ||
    'mongodb+srv://myTrip:myTrip@mytrip.pk6mcuz.mongodb.net/?retryWrites=true&w=majority',
);
mongoose.connection.on('error', (error: Error) => console.log(error));

let users = new BiMap<string, string>();

io.on('connection', (socket: Socket) => {
  console.log('new connection has been made');
  socket.on('new-user', (username) => {
    !users.hasValue(username) && users.set(socket.id, username);
    console.log(`${username} has connected`);
  });
  socket.on('send-message', async (message) => {
    try {

      const newMessage = { ...message };

      const fromUser = await User.findOne({ userName : message.fromUser }); 
      const toUser = await User.findOne({ userName : message.toUser });

      newMessage.fromUser = fromUser._id;
      newMessage.toUser = toUser._id;

      MessageModel.create(newMessage);
    } catch (e) {
      console.error(e);
    }

    const socketId = users.getFromValue(message.toUser);
    if (socketId) {
      io.to(socketId)?.emit('receive-message', message);
    }
    console.log(
      `sending message from ${message.fromUser} to ${message.toUser}`,
    );
  });
  socket.on('disconnect', () => {
    console.log(`${users.get(socket.id)} has disconnected`);
    users.removeByKey(socket.id); 
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http${process.env.NODE_ENV === 'production' && 's'}://localhost:${PORT}`);
});

export default app;
