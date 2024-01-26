import { UserIdDto } from "./UserJwtPaylod";

export interface ChangeUserNameDto extends UserIdDto {
    userName : string
}

export interface ChangePasswordDto extends UserIdDto {
    oldPassword : string,
    newPassword : string
}

export interface ChangeProfileImageDto extends UserIdDto {
    image : string
}