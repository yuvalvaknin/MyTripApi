import { ObjectId } from "mongodb"

interface UserJWTPaylod {
    _id : ObjectId
    userName : string
}

export default UserJWTPaylod;
