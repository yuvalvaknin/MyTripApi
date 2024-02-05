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

beforeAll(async () => {
  console.log("beforeAll");
//   const userId = (await User.findOne({userName : testUser.userName}))._id;
//   PostModel.deleteMany({userId : userId})
});

afterAll(async () => {
  await mongoose.connection.close();
});

let tokens : string[];
export let firstPostId : ObjectId;
let secondPostId : ObjectId;

export const firstPost : createPostDto = {
    country : 'Denmark',
    description : 'Test Denmark',
    photo : 'denmark-photo'
}

const secondPost : createPostDto = {
    country : 'Uganda',
    description : 'Test Uganda',
    photo : 'uganda-photo'
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

    test("Test Get by userName - Empty", async () => {
        const response = await request(app)
        .get(`/posts/byUserName/${testUser.userName}`)
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0)
    });

    test("Test Add Post", async () => {
        const response = await request(app)
        .post("/posts")
        .set('Cookie', tokens)
        .send(firstPost);
        expect(response.statusCode).toBe(200);
        firstPostId = response.body._id;
    });

    test("Test Add without tokens", async () => {
        const response = await request(app)
        .post("/posts")
        .send(firstPost);
        expect(response.statusCode).toBe(401);
    });

    test("Test Add Second Post", async () => {
        const response = await request(app)
        .post("/posts")
        .set('Cookie', tokens)
        .send(secondPost);
        expect(response.statusCode).toBe(200);
        secondPostId = response.body._id;
    });

    test("Test Get by userName", async () => {
        const response = await request(app)
        .get(`/posts/byUserName/${testUser.userName}`)
        expect(response.statusCode).toBe(200);
        expect(postsFilter(response.body).length).toBe(2)
    });

    test("Test Get by country", async () => {
        const response = await request(app)
        .get(`/posts/byCountry/${firstPost.country}`)
        expect(response.statusCode).toBe(200);
        expect(postsFilter(response.body).length).toBe(1)
    });

    test("Test Edit content", async () => {
        const response = await request(app)
        .put(`/posts`)
        .set('Cookie', tokens)
        .send({...firstPost,postId: firstPostId, description : 'content edited'} as UpdatePostDto)
        expect(response.statusCode).toBe(200);
        expect((response.body as returnPostDto).description).toBe('content edited')
    });

    test("Test Edit without tokens", async () => {
        const response = await request(app)
        .put(`/posts`)
        .send({...firstPost, postId : firstPostId ,description : 'content edited'} as UpdatePostDto)
        expect(response.statusCode).toBe(401);
    });

    test("Delete without tokens", async () => {
        const response = await request(app)
        .delete(`/posts/${secondPostId}`)
        expect(response.statusCode).toBe(401);
    });

    test("Test Get by userName - validate doesn't deleted", async () => {
        const response = await request(app)
        .get(`/posts/byUserName/${testUser.userName}`)
        expect(response.statusCode).toBe(200);
        expect(postsFilter(response.body).length).toBe(2)
    });

    test("Delete", async () => {
        const response = await request(app)
        .delete(`/posts/${secondPostId}`)
        .set('Cookie', tokens)
        expect(response.statusCode).toBe(204);
    });

    test("Test Get by userName - validate deleted", async () => {
        const response = await request(app)
        .get(`/posts/byUserName/${testUser.userName}`)
        expect(response.statusCode).toBe(200);
        expect(postsFilter(response.body).length).toBe(1)
    });
});

const postsFilter = (posts : returnPostDto[]) => {
    return posts.filter(pst=> ([firstPostId,secondPostId]).includes(pst.postId))
}
