import { IUser } from "../user";

interface UserResponseDto extends Omit<IUser, 'password' | 'tokens'>{}

export default UserResponseDto;