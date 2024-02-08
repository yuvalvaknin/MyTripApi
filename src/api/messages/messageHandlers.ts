import { Request, Response } from 'express';
import createMessageDto from './dtos/createMessageDto';
import getAllMessageBetweenTwoUsersDto from './dtos/getAllMessageBetweenTwoUsersDto';
import MessageModel, { Message } from './message';

export const createNewMessage = async (req: Request, res: Response) => {
  try {
    const messageData: createMessageDto = req.body;
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
    const users: getAllMessageBetweenTwoUsersDto = req.body;
    const messages: Message[] = await MessageModel.find({
      fromUser: users.firstUser,
      toUser: users.secondUser,
    });
    messages.push(
      ...(await MessageModel.find({
        fromUser: users.secondUser,
        toUser: users.firstUser,
      }))
    );
    res.json(messages);
  } catch (error) {
    console.error('Got an error while fetchin messages:', error);
    res.status(500).send('Internal Server Error');
  }
};
