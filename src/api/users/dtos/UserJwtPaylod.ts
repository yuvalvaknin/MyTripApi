import { ObjectId } from "mongodb"

export type WithUserId<T> = T & { _userId: ObjectId }

export type UserIdDto = WithUserId<{}>

interface UserJWTPaylod {
    _id : ObjectId
    userName : string
}

export default UserJWTPaylod;
