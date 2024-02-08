import { Comment } from "../comment";

export interface returnCommentDto extends Omit<Comment, 'userId'>{
    userName : string
}