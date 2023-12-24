import { NextFunction, Request, Response } from 'express';

import ErrorResponse from './interfaces/ErrorResponse';
import jwt from 'jsonwebtoken';
import { token } from 'morgan';
import { IUser } from './models/UserModel';
import { Types } from 'mongoose';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

interface JwtPayload {
  _id: Types.ObjectId;
  // Add other properties from your jwt payload if needed
}

export function authenticate(req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const authHeaders = req.headers['authorization']?.split(" ");
  if (!authHeaders || authHeaders[0] !== 'Bearer' || !authHeaders[1]) return res.sendStatus(401);
  const token = authHeaders[1];

  jwt.verify(token, process.env.JWT_REFRESH_TOKEN || '', (err, user : jwt.JwtPayload | string | undefined) => {
    if (err) return res.status(403);
    req.body = {...req.body, user : (user as JwtPayload)._id, token : token}
    next()
  })
}
