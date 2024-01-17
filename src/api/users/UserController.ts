import { ObjectId } from "mongoose";
import UserResponseDto from "./dtos/UserResponseDto";
import User, { IUser } from './user';
import { Request, Response } from 'express';

export const getUser = async ( req: Request<any, UserResponseDto|string, {_id : ObjectId}>,
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

export const updateUser = async ( req: Request<any, UserResponseDto|string, {_id : ObjectId} & IUser>,
    res: Response<UserResponseDto | string>) => {
        const reqBody = req.body;
        console.log(`Trying to update user ${reqBody._id}`);
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
                const newUser = await User.findByIdAndUpdate(reqBody._id,reqBody, {new : true});
                res.json(newUser);
            }
            else console.error(`${reqBody._id} doesn't found`)
        } catch (error : any) {
            console.error('Error fetching user:', error.message);
            res.status(500).send(`Error fetching user ${error.message}`);
        }
}

export default { getUser, updateUser }