import { ObjectId } from "mongodb";

interface UpdatePostDto {
  postId: ObjectId;
  description?: string;
  country?: string;
}

export default UpdatePostDto;
