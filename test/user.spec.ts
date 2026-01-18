import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { TestModule } from "./test.module";
import { TestService } from "./test.service";
import cookieParser from "cookie-parser";
describe("UserController", () => {
  let app: INestApplication;
  let testService: TestService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    testService = moduleFixture.get<TestService>(TestService);

    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/users", () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it("should register user successfully", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users")
        .send({
          username: "testuser",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.username).toBe("testuser");
      expect(response.body.password).toBeUndefined();
    });

    it("should return validation error for missing username", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users")
        .send({
          password: "password123",
        });

      expect(response.status).toBe(400);
    });

    it("should return validation error for missing password", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users")
        .send({
          username: "testuser",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser({
        username: "testuser",
        password: "password123",
      });
    });

    it("should login user successfully", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users/login")
        .send({
          username: "testuser",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successfull");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return error for invalid credentials", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users/login")
        .send({
          username: "testuser",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
    });

    it("should return error for non-existent user", async () => {
      const response = await request
        .default(app.getHttpServer())
        .post("/api/users/login")
        .send({
          username: "nonexistent",
          password: "password123",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/users", () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser({
        username: "testuser",
        password: "password123",
      });
    });

    it("should return users successfully with authentication", async () => {
      // First login to get token
      const loginResponse = await request
        .default(app.getHttpServer())
        .post("/api/users/login")
        .send({
          username: "testuser",
          password: "password123",
        });

      const token = loginResponse.headers["set-cookie"][0].split(";")[0];

      console.log("Token: ", token);

      const response = await request
        .default(app.getHttpServer())
        .get("/api/users")
        .set("Cookie", token);

      console.log("Response Body: ", response.body);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].username).toBe("testuser");
    });

    it("should return unauthorized without authentication", async () => {
      const response = await request
        .default(app.getHttpServer())
        .get("/api/users");

      expect(response.status).toBe(401);
    });
  });
});
