import { MongoClient } from 'mongodb';

const {
  MONGO_URI
} = process.env;

export const client = new MongoClient(MONGO_URI || "Mac**bizona");
export const db = client.db();