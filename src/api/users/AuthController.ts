import { NextFunction, Request, Response } from 'express';
import User, { IUser } from './user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RegisterDto from './dtos/RegisterDto';
import {LoginDto, LoginResponseDto} from './dtos/LoginDto';
import { ObjectId } from 'mongodb';
import UserResponseDto from './dtos/UserResponseDto';
import UserJWTPaylod from './dtos/UserJwtPaylod';
import axios from 'axios';
import mongoose from 'mongoose';

const register = async (req: Request<any, string, RegisterDto>, res: Response<string>) => {
    const reqBody = req.body;
    console.log(`trying to register ${reqBody.userName}`)
    if (!reqBody.email || !reqBody.password) {
        console.error("missing email or password")
        return res.status(400).send("missing email or password");
    }
    try {
        const userByEmail = await User.findOne({ email: reqBody.email });
        if (userByEmail != null) {
            console.error("email already exists")
            return res.status(406).send("email already exists");
        }
        const userByUN = await User.findOne({ userName : reqBody.userName });
        if (userByUN != null) {
            console.error("User Name already exists")
            return res.status(406).send("User Name already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(reqBody.password, salt);
        const userCreated = await User.create({...reqBody, password: encryptedPassword, tokens : []});
        console.log(`${userCreated.userName} registerd`)
        return res.status(201).send(userCreated.userName);
    } catch (err) {
        console.error("error at register")
        return res.status(400).send("error at register");
    }
}

const loginUser = async (user : (mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: ObjectId;
}), res : Response) => {
    const cookies = createCookies(user, res)
    if (cookies){
        user.tokens.push(cookies.refreshToken);
        await user.save();
        console.error(`${user.userName} logged in`)
        return res.status(200).send({'userName' : user.userName ,'accessToken': cookies.accessToken, 'refreshToken' : cookies.refreshToken });
    }
    return res;
}

const createCookies = (user : (mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: ObjectId;
}), res : Response) => {
    if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN)
    {            
        console.error("app tokens doesn't exist")
        res.status(400);
        return
    }
    const accessToken = jwt.sign({ _id : user._id, userName : user.userName } as UserJWTPaylod, process.env.JWT_ACCESS_TOKEN, { expiresIn: process.env.JWT_EXPIRATION });
    const refreshToken = jwt.sign({ _id: user._id, userName : user.userName } as UserJWTPaylod, process.env.JWT_REFRESH_TOKEN);
    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);
    return {accessToken : accessToken, refreshToken : refreshToken}
}

const login = async (req: Request<any, LoginResponseDto|string, LoginDto>,
     res: Response<LoginResponseDto | string>) => {
    const reqBody = req.body;
    if (!reqBody.userName || !reqBody.password) {
        console.error("missing email or password")
        return res.status(400).send("missing email or password");
    }
    try {
        const user = await User.findOne({ userName: reqBody.userName });
        if (user == null) {
            console.error("there is no user with this email")
            return res.status(401).send("there is no user with this email");
        }
        const passwordMatch = await bcrypt.compare(reqBody.password, user.password);
        if (!passwordMatch) {
            console.error("incorrect password")
            return res.status(401).send("incorrect password");
        }
        loginUser(user, res);
        
    } catch (err) {
        console.error("error in login")
        return res.status(400).send("error in login");
    }
}

export const getUser = async ( req: Request<any, UserResponseDto|string, ObjectId>,
     res: Response<UserResponseDto | string>) => {
    console.log(`Trying to get user ${req.body._id}`);
    try {
      const user = await User.findById(req.body._id);
      if (user)
      {
        console.log(`got user ${user.userName}`);
        res.json({ userName : user.userName});
      }
      else console.error(`${req.body._id} doesn't found`)
    } catch (error : any) {
      console.error('Error fetching user:', error.message);
      res.status(500).send(`Error fetching user ${error.message}`);
    }
  }

const logout = async (req: Request<any, string, ObjectId>, res: Response<string>) => {
    try {
        console.log(`Trying to logout user ${req.body._id}`);
        const user = await User.findById(req.body._id);
        const userToken = req.cookies['refresh_token'];
        if (user == null || userToken == null) {
            console.error('no user to logout');
            return res.status(403).send('no user to logout')
        }
        if(!user.tokens.includes(userToken)){
            user.tokens = []
            await user.save();
            console.error(`token expired long time ago, clean ${user.userName} tokens`);
            return res.status(403).send("the token doesn't exist anymore")
        }
        user.tokens = user.tokens.map(tok => tok === userToken ? userToken : tok );
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        await user.save();
        console.log(`${user.userName} logged out successfuly`)
        return res.status(200).send('logout successfuly')
    } catch (err : any) {
        console.error(`failed to logout`)
        return res.status(403).send(err.message);
    }
}

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log('trying refresh token')
    const token = req.cookies["refresh_token"];
    if (token == null) {
        console.error("token doesn't exist")
         return res.sendStatus(401);
    }
    if (process.env.JWT_REFRESH_TOKEN === undefined) {
        console.error("app tokens doesn't exist")
        return res.sendStatus(403);
    }
    jwt.verify(token, process.env.JWT_REFRESH_TOKEN, async (err : any, jwtUser : any) => {
        if (err) {
            console.error(err.message)
            return res.status(403).send(err.message)
        }
        if (!jwtUser){
            console.error("user doesn't exist at token")
            return res.status(403); 
        }
        try {
            var verifiedUser = await User.findById((jwtUser as UserJWTPaylod)._id);
            if (verifiedUser == null){
                console.log(`${(jwtUser as UserJWTPaylod).userName} doesn't exist`)
                 return res.status(403).send("user doesn't exist"); 
            }
            if(!verifiedUser.tokens.includes(token)){
                verifiedUser.tokens = []
                await verifiedUser.save();
                console.error(`token expired long time ago, clean ${verifiedUser.userName} tokens`);
                return res.status(403).send("the token doesn't exist anymore")
            }

            const tokens = createCookies(verifiedUser, res)
            if (tokens){
                verifiedUser.tokens = verifiedUser.tokens.map(tok => tok === token ? tokens.refreshToken : tok );
                await verifiedUser.save();
                console.log(`token refreshed for ${verifiedUser.userName}`)
                req.body = {...req.body, _id : verifiedUser._id}
                next()
            }
            return res;
        } catch (error : any) {
            console.error(`couldn't refresh token: ${error.message}`)
            return res.status(403).send(error.message)
        }
    });
}

const tryCreateUser = async (userName : string) => { 
    let user = await User.findOne({ userName: userName }); 
    let index = 0; 
    while (user != null) { 
        index++ 
        user = await User.findOne({ userName: userName + index }); 
    } 
    return index === 0 ? userName : userName + index; 
} 
 
const googleLogin = async (req: Request<any, LoginResponseDto|string, {token : string}>, 
    res: Response<LoginResponseDto | string>) => { 
    const token = req.body.token; 
    try { 
    const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`).then(res => res.data); 
    let user : any = await User.findOne({ email : googleResponse.email }) 
    if (user == null){ 
        const userName = await tryCreateUser(googleResponse.name)  
        user = await User.create({email : googleResponse.email, userName : userName, tokens :[], isGoogleLogin : true}) 
    } 
    loginUser(user, res);
    } catch (ex : any) { 
        return res.status(400).send(ex.message); 
    } 
} 
 
export default {
    register,
    login,
    logout,
    refreshToken,
    getUser,
    googleLogin 
}