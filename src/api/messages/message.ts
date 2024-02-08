import mongoose, { Document, Schema, Types } from 'mongoose';

export interface Message extends Document {
  fromUser: Types.ObjectId | string;
  toUser: Types.ObjectId | string;
  messageContent: string;
  sendTime: Date;
}

const messageSchema = new Schema({
  fromUser: {
    type: Types.ObjectId, 
    ref: 'users',
    require: true
  },
  toUser: {
    type: Types.ObjectId, 
    ref: 'users',
    require: true
  },
  messageContent: String,
  sendTime: {
    type: Date,
    default: Date.now,
    require: true
  },
});

messageSchema.pre<Message>('save', function (next) {
    if (!this.sendTime) {
      this.sendTime = new Date();
    }
    next();
});

const MessageModel = mongoose.model<Message>('Message', messageSchema);

export default MessageModel;