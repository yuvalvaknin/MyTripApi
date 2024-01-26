import bcrypt from 'bcrypt';
import UserResponseDto from "./dtos/UserResponseDto";
import User, { IUser } from './user';
import { Request, Response } from 'express';
import { UserIdDto } from "./dtos/UserJwtPaylod";
import { ChangePasswordDto, ChangeProfileImageDto, ChangeUserNameDto } from "./dtos/UpdateUserDtos";
import { USER_PHOTOS_DIR_PATH, encryptPassword } from './AuthController';
import fs from 'fs';
import path from 'path';
import mongoose, { Types } from 'mongoose';

export const attachProfilePhoto = (user : mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: Types.ObjectId;
}) : UserResponseDto  =>{
    const filePath = path.join(USER_PHOTOS_DIR_PATH, user._id.toString());
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return ({email : user.email, isGoogleLogin : user.isGoogleLogin, userName: user.userName, image : fileContent})
      }
    return ({email : user.email, isGoogleLogin : user.isGoogleLogin, userName: user.userName, image : ''})
}

export const getUser = async ( req: Request<any, UserResponseDto|string, UserIdDto>,
    res: Response<UserResponseDto | string>) => {
   console.log(`Trying to get user ${req.body._id}`);
   try {
     const user = await User.findById(req.body._id);
     if (user)
     {
       console.log(`got user ${user.userName}`);
       res.json(attachProfilePhoto(user));
     }
     else console.error(`${req.body._id} doesn't found`)
   } catch (error : any) {
     console.error('Error fetching user:', error.message);
     res.status(500).send(`Error fetching user ${error.message}`);
   }
}

export const updateUserName = async ( req: Request<any, UserResponseDto|string, ChangeUserNameDto>,
    res: Response<UserResponseDto | string>) => {
        const reqBody = req.body;
        console.log(`Trying to update userName for ${reqBody._id}`);
        try {
            const user = await User.findById(reqBody._id);
            if (user)
            {
                console.log(`got user ${user.userName}`);
                if (user.userName !== reqBody.userName) {
                    const alreadyExistedUser = await User.findOne({userName : reqBody.userName})
                    if (alreadyExistedUser) {
                        console.log('username already existed');
                        return res.status(400).send('username already existed')
                    }
                }
                console.log(`userName changed from ${user.userName} to ${reqBody.userName}`)
                user.userName = reqBody.userName;
                await user.save();
                res.json(attachProfilePhoto(user));
            }
            else console.error(`${reqBody._id} doesn't found`)
        } catch (error : any) {
            console.error('Error fetching user:', error.message);
            res.status(500).send(`Error fetching user ${error.message}`);
        }
}

export const updatePassword = async ( req: Request<any, UserResponseDto|string, ChangePasswordDto>,
    res: Response<UserResponseDto | string>) => {
        const reqBody = req.body;
        console.log(`Trying to update password for ${reqBody._id}`);
        try {
            const user = await User.findById(reqBody._id);
            if (user)
            {
                console.log(`got user ${user.userName}`);
                const passwordMatch = await bcrypt.compare(reqBody.oldPassword, user.password);
                if (!passwordMatch) {
                    console.error("incorrect password")
                    return res.status(401).send("incorrect password");
                }
                user.password = await encryptPassword(reqBody.newPassword);
                await user.save();
                console.log(`password updated successfuly for ${user.userName}`)
                res.json(attachProfilePhoto(user));
            }
            else console.error(`${reqBody._id} doesn't found`)
        } catch (error : any) {
            console.error('Error fetching user:', error.message);
            res.status(500).send(`Error fetching user ${error.message}`);
        }
}

export const updateProflieImage = async ( req: Request<any, UserResponseDto|string, ChangeProfileImageDto>,
    res: Response<UserResponseDto | string>) => {
        const reqBody = req.body;
        console.log(`Trying to update profile image for ${reqBody._id}`);
        try {
            const user = await User.findById(reqBody._id);
            if (user)
            {
                console.log(`got user ${user.userName}`);
                if (reqBody.image) {
                    const filePath = path.join(USER_PHOTOS_DIR_PATH, reqBody._id.toString());
                    fs.writeFileSync(filePath, reqBody.image);
                }
                console.log(`password updated successfuly for ${user.userName}`)
                res.json(attachProfilePhoto(user));
            }
        } catch (error : any) {
            console.error('Error fetching user:', error.message);
            res.status(500).send(`Error fetching user ${error.message}`);
        }
}

export default { getUser, updateUserName,updatePassword, updateProflieImage }