import { NextFunction, Request, Response } from 'express';
import User, { IUser } from './user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RegisterDto from './dtos/RegisterDto';
import {LoginDto, UserResponseDto} from './dtos/LoginDto';
import { ObjectId } from 'mongodb';
import UserJWTPaylod, { UserIdDto } from './dtos/UserJwtPaylod';
import axios from 'axios';
import mongoose from 'mongoose';
import { attachProfilePhoto } from './UserController';
import { addPhoto, createPhotoDirectory } from '../../utils/photoUtils';
import { OAuth2Client } from 'google-auth-library';

export const USER_PHOTOS_DIR_PATH = createPhotoDirectory(__dirname);

export const encryptPassword = async (password : string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

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
        const encryptedPassword = await encryptPassword(reqBody.password)
        const userCreated = await User.create({...reqBody, password: encryptedPassword, tokens : []});

        addPhoto(USER_PHOTOS_DIR_PATH, userCreated._id.toString(), reqBody.image);

        console.log(`${userCreated.userName} registerd`)
        return res.status(201).send(userCreated.userName);
    } catch (err) {
        console.error("error at register")
        return res.status(400).send("error at register");
    }
}

const loginUser = async (user : (mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: ObjectId;
}), res : Response<UserResponseDto | string>) => {
    const cookies = createCookies(user, res)
    if (cookies){
        user.tokens.push(cookies.refreshToken);
        await user.save();
        console.info(`${user.userName} logged in`)
        return res.json(attachProfilePhoto(user));
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
    res.cookie('access_token', accessToken, {sameSite: 'none', secure: true, httpOnly: true});
    res.cookie('refresh_token', refreshToken, {sameSite: 'none', secure: true, httpOnly: true});
    return {accessToken : accessToken, refreshToken : refreshToken}
}

const login = async (req: Request<any, UserResponseDto|string, LoginDto>,
     res: Response<UserResponseDto | string>) => {
    const reqBody = req.body;
    if (!reqBody.userName || !reqBody.password) {
        console.error("missing userName or password")
        return res.status(400).send("missing usrName or password");
    }
    try {
        const user = await User.findOne({ userName: reqBody.userName });
        if (user == null) {
            console.error("there is no user with this userName")
            return res.status(401).send("there is no user with this userName");
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

const logout = async (req: Request<any, string, UserIdDto>, res: Response<string>) => {
    try {
        console.log(`Trying to logout user ${req.body._userId}`);
        const user = await User.findById(req.body._userId);
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
        user.tokens = user.tokens.filter(tok => tok !== userToken);
        res.clearCookie('access_token', {httpOnly : true, sameSite : 'none', secure : true})
        res.clearCookie('refresh_token', {httpOnly : true, sameSite : 'none', secure : true})
        await user.save();
        console.log(`${user.userName} logged out successfuly`)
        return res.status(200).send('logout successfuly')
    } catch (err : any) {
        console.error(`failed to logout`)
        return res.status(403).send(err.message);
    }
}

const refreshToken = async (req: Request, res: Response) => {
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
                return res.status(200).send('token refreshed successfuly')
            }else {
                return res.status(400).send('problem in token refreshing')
            }
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
const client = new OAuth2Client();

const googleLogin = async (req: Request<any, UserResponseDto|string, {token : string}>, 
    res: Response<UserResponseDto | string>) => { 
    const token = req.body.token; 
    try { 
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googleResponse = ticket.getPayload();
    let user : any = await User.findOne({ email : googleResponse.email }) 
    if (user == null){ 
        const userName = await tryCreateUser(googleResponse.name)  
        user = await User.create({email : googleResponse.email, userName : userName, tokens :[], isGoogleLogin : true}) 
        const googleImage = await axios.get(googleResponse.picture, { responseType : 'arraybuffer'});
        addPhoto(USER_PHOTOS_DIR_PATH, user._id.toString(), `data:image/png;base64,${Buffer.from(googleImage.data, 'binary').toString('base64')}`)
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
    googleLogin 
}
