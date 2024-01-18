import { ObjectId } from "mongodb"

export interface UserIdDto {
    _id : ObjectId
}

interface UserJWTPaylod extends UserIdDto {
    userName : string
}

export default UserJWTPaylod;
