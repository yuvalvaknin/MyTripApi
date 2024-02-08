import request from "supertest";
import mongoose from "mongoose";
import app from '../src/app'
import { LoginDto } from "../src/api/users/dtos/LoginDto";
import { testPictureChange as testUser } from "./user.test";
import {firstPost } from './post.test'
import { returnCommentDto } from "../src/api/comments/dtos/returnCommentDto";
import { Comment } from "../src/api/comments/comment";

beforeAll(async () => {
    console.log("before all");
});

afterAll(async () => {
  await mongoose.connection.close();
});
let tokens : string[];
let firstPostId;
let comment;

describe("Comment tests", () => {
    test("Test Login", async () => {
        const response = await request(app)
          .post("/auth/login").send({
            password : testUser.password,
            userName : testUser.userName
          } as LoginDto);
        expect(response.statusCode).toBe(200);
        tokens = response.headers['set-cookie'];
    });

    test("Test Add Post", async () => {
        const response = await request(app)
        .post("/posts")
        .set('Cookie', tokens)
        .send(firstPost);
        expect(response.statusCode).toBe(200);
        firstPostId = response.body._id;
        comment = {commentContent : 'תגובה',postId : firstPostId} as Omit<Comment, 'userId'>
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
