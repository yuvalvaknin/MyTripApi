import { IUser } from "../user";

interface UserResponseDto extends Omit<IUser, 'password' | 'tokens'>{
    image : string
}

export default UserResponseDto;