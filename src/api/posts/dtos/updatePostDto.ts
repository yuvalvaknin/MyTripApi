import { ObjectId } from "mongodb";

interface UpdatePostDto {
  postId: ObjectId;
  description?: string;
  country?: string;
  photo?: string;
}

export default UpdatePostDto;
