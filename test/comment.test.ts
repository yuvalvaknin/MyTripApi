import request from "supertest";
import mongoose from "mongoose";
import User, { IUser } from "../src/api/users/user";
import app from '../src/app'
import { testUser } from "./auth.test";
import { LoginDto, UserResponseDto } from "../src/api/users/dtos/LoginDto";
import RegisterDto from "../src/api/users/dtos/RegisterDto";
import createPostDto from "../src/api/posts/dtos/createPostDto";
import PostModel from "../src/api/posts/post";
import exp from "constants";
import returnPostDto from "../src/api/posts/dtos/returnPostDto";
import UpdatePostDto from "../src/api/posts/dtos/updatePostDto";
import { ObjectId } from "mongodb";
import { Comment } from "../src/api/comments/comment";
import { firstPost, firstPostId } from "./post.test";
import { returnCommentDto } from "../src/api/comments/dtos/returnCommentDto";


let postId : ObjectId;
beforeAll(async () => {
  console.log("beforeAll");
  debugger
  const response = await request(app)
        .post("/posts")
        .set('Cookie', tokens)
        .send(firstPost);
    postId = (response.body as returnPostDto).postId
});

afterAll(async () => {
  await mongoose.connection.close();
});

let tokens : string[];

const comment : Omit<Comment, 'userId'> = {
    commentContent : 'תגובה',
    postId : postId.toString()
}

describe("Posts tests", () => {
    test("Test Login", async () => {
        const response = await request(app)
          .post("/auth/login").send({
            password : testUser.password,
            userName : testUser.userName
          } as LoginDto);
        expect(response.statusCode).toBe(200);
        tokens = response.headers['set-cookie'];
    });

    test("Test create Comment without tokens", async () => {
        const response = await request(app)
        .post(`/comments/postComment`)
        .send(comment)
        expect(response.statusCode).toBe(401);
    });

    test("Get comments number by post - Empty", async () => {
        const response = await request(app)
        .get(`/comments/commentsCounter/${firstPostId}`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(0)
    });

    test("Get comments by post - Empty", async () => {
        const response = await request(app)
        .get(`/comments/getCommentsByPost/${firstPostId}`)
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0)
    });

    test("Test create Comment", async () => {
        const response = await request(app)
        .post(`/comments/postComment`)
        .set('Cookie', tokens)
        .send(comment)
        expect(response.statusCode).toBe(200);
    });

    test("Get comments number by post", async () => {
        const response = await request(app)
        .get(`/comments/commentsCounter/${firstPostId}`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(1)
    });

    test("Get comments by post", async () => {
        const response = await request(app)
        .get(`/comments/getCommentsByPost/${firstPostId}`)
        expect(response.statusCode).toBe(200);
        expect(compareComments({...comment, userName : testUser.userName}, response.body))
    });
});

const compareComments = (commentA : returnCommentDto, commentB : returnCommentDto) => 
     commentA.commentContent === commentB.commentContent && commentA.postId === commentB.postId &&
    commentA.userName === commentB.userName
