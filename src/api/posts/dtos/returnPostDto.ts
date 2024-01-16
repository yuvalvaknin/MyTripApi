import { ObjectId } from "mongodb";

interface returnPostDto {
    postId: ObjectId;
    description: string;
    country: string;
    userName: string;
    photo: string | null;
}

export default returnPostDto;