import { ObjectId } from "mongodb"

export type WithUserId<T> = T & { _id: ObjectId }

export type UserIdDto = WithUserId<{}>

interface UserJWTPaylod extends UserIdDto {
    userName : string
}

export default UserJWTPaylod;
