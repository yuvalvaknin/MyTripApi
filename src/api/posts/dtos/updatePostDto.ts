import { ObjectId } from "mongodb";

interface updatePostDto {
    postId: ObjectId;
    description?: string;
    country?: string;
}

export default updatePostDto;