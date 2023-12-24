import { Request, Response } from 'express';
import User from '../models/UserModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(400).send("missing email or password");
    }
    try {
        const rs = await User.findOne({ 'email': email });
        if (rs != null) {
            return res.status(406).send("email already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const rs2 = await User.create({ 'email': email, 'password': encryptedPassword });
        return res.status(201).send(rs2);
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}

const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(400).send("missing email or password");
    }
    try {
        const user = await User.findOne({ 'email': email });
        if (user == null) {
            return res.status(401).send("there is no user with this email");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send("password incorrect");
        }

        const accessToken = jwt.sign({ _id : user._id }, process.env.JWT_ACCESS_TOKEN || '', { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_TOKEN || '');

        user.tokens == null ? user.tokens = [refreshToken] : user.tokens.push(refreshToken);
        await user.save();

        return res.status(200).send({'userName' : user.userName ,'accessToken': accessToken, 'refreshToken' : refreshToken });
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}



const logout = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.body.user);
        if (user == null) return res.status(403).send('invalid Request')
        if(!user.tokens.includes(req.body.token)){
            user.tokens.slice(0, user.tokens.length);
            await user.save();
            return res.status(403).send('invalid Request')
        }
        user.tokens.splice(user.tokens.findIndex(tok => tok === req.body.token), 1)
        await user.save();
        return res.sendStatus(200)
    } catch (err) {
        return res.status(403).send(err);
    }
}

export default {
    register,
    login,
    logout
}