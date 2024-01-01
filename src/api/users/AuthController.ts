import { Request, Response } from 'express';
import User, { IUser } from './user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import { JwtPayload } from '../../middlewares';

const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;
    if (!email || !password) {
        return res.status(400).send("missing email or password");
    }
    try {
        const rs = await User.findOne({ 'email': email });
        if (rs != null) {
            return res.status(406).send("email already exists");
        }
        const userByUN = await User.findOne({ 'userName' : userName });
        if (userByUN != null) {
            return res.status(406).send("User Name already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const rs2 = await User.create({ 'email': email, 'password': encryptedPassword, userName: userName});
        return res.status(201).send(rs2.userName);
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}

const login = async (req: Request, res: Response) => {
    const userName = req.body.userName;
    const password = req.body.password;
    if (!userName || !password) {
        return res.status(400).send("missing email or password");
    }
    try {
        const user = await User.findOne({ 'userName': userName });
        if (user == null) {
            return res.status(401).send("there is no user with this email");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send("password incorrect");
        }

        const accessToken = jwt.sign({ _id : user._id, userName : user.userName }, process.env.JWT_ACCESS_TOKEN || '', { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = jwt.sign({ _id: user._id, userName : user.userName }, process.env.JWT_REFRESH_TOKEN || '');
        res.cookie('access_token', accessToken);
        res.cookie('refresh_token', refreshToken);
        user.tokens == null ? user.tokens = [refreshToken] : user.tokens.push(refreshToken);
        await user.save();

        return res.status(200).send({'userName' : user.userName ,'accessToken': accessToken, 'refreshToken' : refreshToken });
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}

const cleanTokens = async (user : mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: Types.ObjectId;
}) => {
    user.tokens.slice(0, user.tokens.length);
    await user.save();
}

export const getUser = async (req: Request, res: Response) => {
    console.log('Got final all posts request');
    try {
      const user = await User.findById(req.body._id);
      if (user) res.json({userName : user.userName});
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).send('Internal Server Error');
    }
  }

const logout = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.body._id);
        if (user == null) return res.status(403).send('invalid Request')
        if(!user.tokens.includes(req.body.token)){
            cleanTokens(user);
            return res.status(403).send('invalid Request')
        }
        user.tokens.splice(user.tokens.findIndex(tok => tok === req.body.token), 1)
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        await user.save();
        return res.sendStatus(200)
    } catch (err) {
        return res.status(403).send(err);
    }
}

const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies["refresh_token"];

    if (token == null) res.sendStatus(401);

    jwt.verify(token, process.env.JWT_REFRESH_TOKEN || '', async (err : any, user : string | jwt.JwtPayload | undefined) => {
        if (err) return res.status(403).send(err.message)
        if (!user) return res.status(403);
        const userId = (user as JwtPayload)._id;

        try {
            var currUser :  (mongoose.Document<unknown, {}, IUser> & IUser & {
                _id: Types.ObjectId;
            }) | null = await User.findById(userId);
            if (currUser == null) return res.status(403).send('invalid request'); 
            if (!currUser.tokens.includes(token)){
                cleanTokens(currUser);
                return res.status(403).send('invalid Request')
            }

            const accessToken = jwt.sign({ _id : currUser._id, userName : currUser.userName }, process.env.JWT_ACCESS_TOKEN || '', { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = jwt.sign({ _id: currUser._id, userName : currUser.userName }, process.env.JWT_REFRESH_TOKEN || '');
            
            res.cookie('access_token', accessToken);
            res.cookie('refresh_token', refreshToken);

            currUser.tokens == null ? currUser.tokens = [refreshToken] : currUser.tokens[currUser.tokens.indexOf(token)] = refreshToken;
            await currUser.save();
            res.status(200).send({'accessTokten' : accessToken, 'refreshToken' : refreshToken})
        } catch (error : any) {
            res.status(403).send(error.message)
        }
    });
}

export default {
    register,
    login,
    logout,
    refreshToken,
    getUser
}