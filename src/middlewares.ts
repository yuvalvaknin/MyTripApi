import { NextFunction, Request, Response } from 'express';
import authController from "./api/users/AuthController";
import ErrorResponse from './interfaces/ErrorResponse';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import UserJWTPaylod from './api/users/dtos/UserJwtPaylod';

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

export function authenticate(req: Request, res: Response, next: NextFunction) {
  console.log('start authenticate')
  const token = req.cookies['access_token'];
  if (!token){
      console.error('there is no cookie to authenticate')
      res.status(400).send('there is no cookies');
  } else {
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN || '', (err : any, user : any) => {
      if (err) {
        if (err.name === 'TokenExpiredError' && req.cookies['refresh_token']){
          authController.refreshToken(req, res, next);
        } else {
          console.error(`token problem`)
          res.sendStatus(403);
        }
      } else {  
        console.log(`${(user as UserJWTPaylod).userName} authenticated successfuly`)
        req.body = {...req.body, _id : (user as UserJWTPaylod)._id}
        next()
      }
    });
  }
}
