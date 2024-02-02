import { Request, Response } from 'express';
import MessageModel, { Message } from './message';
import User from '../users/user';

export const createNewMessage = async (req: Request, res: Response) => {
  try {
    let messageData = req.body;

    const fromUser = await User.findOne({userName : messageData.fromUser}); 
    const toUser = await User.findOne({userName : messageData.toUser});

    messageData.fromUser = fromUser._id;
    messageData.toUser = toUser._id;

   const newMessage = await MessageModel.create(messageData);

    res.json(newMessage);
  } catch (error) {
    console.error('Got an error while creating message:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const getAllMessageBetweenTwoUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = req.body;
    const firstUserName = users.firstUser;
    const secondsUserName = users.secondUser;

    users.firstUser = await User.findOne({userName : users.firstUser});
    users.secondUser = await User.findOne({userName : users.secondUser});

    const messages: Message[] = await MessageModel.find({
      fromUser: users.firstUser,
      toUser: users.secondUser,
    }).lean();

    messages.map(message => {
      message.fromUser = firstUserName;
      message.toUser = secondsUserName;
      return message;
    });
    
    messages.push(
      ...((await MessageModel.find({
        fromUser: users.secondUser,
        toUser: users.firstUser,
      }).lean()).map((message) => {
        message.fromUser = secondsUserName;
        message.toUser = firstUserName;
        return message;
      }))
    );

    res.json(messages);
  } catch (error) {
    console.error('Got an error while fetching messages:', error);
    res.status(500).send('Internal Server Error');
  }
};
