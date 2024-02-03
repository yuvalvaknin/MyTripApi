import request from "supertest";
import mongoose from "mongoose";
import User from "../src/api/users/user";
import app from '../src/app'
import RegisterDto from "../src/api/users/dtos/RegisterDto";
import { LoginDto } from "../src/api/users/dtos/LoginDto";

const user : RegisterDto = {
  email: "test@test.com",
  password: "test",
  image : 'no-content',
  userName : 'test'
}

beforeAll(async () => {
  console.log("beforeAll");
  await User.deleteMany({ 'email': user.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

let accessToken: string;
let refreshToken: string;
let newRefreshToken: string

let tokens : string[];

describe("Auth tests", () => {
  test("Test Register", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(user);
    expect(response.statusCode).toBe(201);
  });

  test("Test Register exist email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(user);
    expect(response.statusCode).toBe(406);
  });

  test("Test Register exist userName", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(user);
    expect(response.statusCode).toBe(406);
  });

  test("Test Register missing email", async () => {
    const response = await request(app)
      .post("/auth/register").send({
        ...user,
        email :undefined
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test Login", async () => {
    const response = await request(app)
      .post("/auth/login").send({
        password : user.password,
        userName : user.userName
      } as LoginDto);
    expect(response.statusCode).toBe(200);
    tokens = response.headers['set-cookie'];
  });

  test("Test forbidden access without token", async () => {
    const response = await request(app).get("/user");
    expect(response.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get("/user")
      .set('Cookie', tokens);
    expect(response.statusCode).toBe(200);
  });

  test("Test access with invalid token", async () => {
    const invalidTokens = tokens.slice(1,1);
    const response = await request(app)
      .get("/user")
      .set('Cookie', invalidTokens);
    expect(response.statusCode).toBe(401);
  });

  jest.setTimeout(10000);

  test("Test access after timeout of token", async () => {
    await new Promise(resolve => setTimeout(() => resolve("done"), 5000));

    const response = 
    await request(app)
      .get("/user")
      .set('Cookie', tokens);
    
      expect(response.statusCode).toBe(401);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .post("/auth/refreshToken")
      .set('Cookie', tokens)
      .send();
    expect(response.statusCode).toBe(200);

    const newTokens = response.headers['set-cookie'];

    const response2 = await request(app)
      .get("/user")
      .set('Cookie', newTokens);
    expect(response2.statusCode).toBe(200);
  });

  // test("Test double use of refresh token", async () => {
  //   const response = await request(app)
  //     .get("/auth/refresh")
  //     .set("Authorization", "JWT " + refreshToken)
  //     .send();
  //   expect(response.statusCode).not.toBe(200);

  //   //verify that the new token is not valid as well
  //   const response1 = await request(app)
  //     .get("/auth/refresh")
  //     .set("Authorization", "JWT " + newRefreshToken)
  //     .send();
  //   expect(response1.statusCode).not.toBe(200);
  // });
});
