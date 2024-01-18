import bcrypt from 'bcrypt';
import UserResponseDto from "./dtos/UserResponseDto";
import User, { IUser } from './user';
import { Request, Response } from 'express';
import { UserIdDto } from "./dtos/UserJwtPaylod";
import { ChangePasswordDto, ChangeUserNameDto } from "./dtos/UpdateUserDtos";
import { encryptPassword } from './AuthController';

export const getUser = async ( req: Request<any, UserResponseDto|string, UserIdDto>,
    res: Response<UserResponseDto | string>) => {
   console.log(`Trying to get user ${req.body._id}`);
   try {
     const user = await User.findById(req.body._id);
     if (user)
     {
       console.log(`got user ${user.userName}`);
       res.json(user);
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
                res.json({
                    userName : user.userName,
                    email: user.email,
                    isGoogleLogin : user.isGoogleLogin
                });
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
                res.json({
                    userName : user.userName,
                    email: user.email,
                    isGoogleLogin : user.isGoogleLogin
                });
            }
            else console.error(`${reqBody._id} doesn't found`)
        } catch (error : any) {
            console.error('Error fetching user:', error.message);
            res.status(500).send(`Error fetching user ${error.message}`);
        }
}

export default { getUser, updateUserName,updatePassword }