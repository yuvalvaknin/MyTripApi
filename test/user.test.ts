import request from "supertest";
import mongoose from "mongoose";
import User, { IUser } from "../src/api/users/user";
import app from '../src/app'
import { testUser } from "./auth.test";
import { LoginDto, UserResponseDto } from "../src/api/users/dtos/LoginDto";
import RegisterDto from "../src/api/users/dtos/RegisterDto";

beforeAll(async () => {
  console.log("beforeAll");
});

afterAll(async () => {
  await mongoose.connection.close();
});

let tokens : string[];
const testUserNameChange : RegisterDto & {isGoogleLogin : boolean} = {...testUser, userName : 'TestChange', isGoogleLogin : true}
const testPasswordChange : RegisterDto & {isGoogleLogin : boolean} = {...testUserNameChange, password : 'TestPasswordChange'}
export const testPictureChange : RegisterDto & {isGoogleLogin : boolean} = {...testPasswordChange, image : 'image-change'}

describe("User tests", () => {
    test("Test Login", async () => {
        const response = await request(app)
          .post("/auth/login").send({
            password : testUser.password,
            userName : testUser.userName
          } as LoginDto);
        expect(response.statusCode).toBe(200);
        tokens = response.headers['set-cookie'];
    });

    test("Test Get User", async () => {
        const response = await request(app)
        .get("/user")
        .set('Cookie', tokens)
        .send(testUser);
        expect(response.statusCode).toBe(200);
        expect((response.body as IUser).userName === testUser.userName)
    });

    test("Test Username Change", async () => {
        const response = await request(app)
        .post("/user/userName")
        .set('Cookie', tokens)
        .send({userName : testUserNameChange.userName});
        expect(response.statusCode).toBe(200);
        expect(userComapre(response.body, testUserNameChange));
    });

    test("Test Password Change", async () => {
        const response = await request(app)
        .post("/user/password")
        .set('Cookie', tokens)
        .send({oldPassword : testUserNameChange.password, newPassword : testPasswordChange.password});
        expect(response.statusCode).toBe(200);
        expect(userComapre(response.body, testPasswordChange));
    });

    test("Test Picture Change", async () => {
      const response = await request(app)
      .post("/user/profileImage")
      .set('Cookie', tokens)
      .send({image : testPictureChange.image});
      expect(response.statusCode).toBe(200);
      expect(userComapre(response.body, testPictureChange));
  });

  test("Test All Change Completed", async () => {
    const response = await request(app)
    .get("/user")
    .set('Cookie', tokens);
    expect(response.statusCode).toBe(200);
    expect(userComapre(response.body, testPictureChange))
  });

  test("Get Profile Image", async () => {
    const response = await request(app)
    .get(`/user/profileImage/${testPictureChange.userName}`)
    expect(response.statusCode).toBe(200);
  });
});

const userComapre = (user : UserResponseDto, userB : UserResponseDto) => {
  return user.email === userB.email && user.isGoogleLogin === userB.isGoogleLogin && user.image === userB.image;
}
