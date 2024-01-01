import { NextFunction, Request, Response } from 'express';
import authController from "./api/users/AuthController";
import ErrorResponse from './interfaces/ErrorResponse';
import jwt from 'jsonwebtoken';
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

export interface JwtPayload {
  _id: Types.ObjectId;
  userName : string;
  // Add other properties from your jwt payload if needed
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies['access_token']){
      res.status(400).send('there is no cookies');
  } else {
    const token = req.cookies['access_token'];
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN || '', (err : any, user : jwt.JwtPayload | string | undefined) => {
      if (err) {
        if (err.name === 'TokenExpiredError' && req.cookies['refresh_token']){
          authController.refreshToken(req, res);
        }
        return res.status(403);
      }
      req.body = {...req.body, _id : (user as JwtPayload)._id}
      next()
    });
  }
}
