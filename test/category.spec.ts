import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('CategoryController (Integration)', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    testService = moduleFixture.get<TestService>(TestService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/categories/:userId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should successfully create a new category and return 201', async () => {
      // Create a user first
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      const payload: CreateCategoryDTO = {
        name: 'test category',
      };

      const response = await request
        .default(app.getHttpServer())
        .post(`/api/categories/${user.id}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('test category');
    });

    it('should return 400 Bad Request if payload is invalid', async () => {
      // Create a user first
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      const invalidPayload = {
        name: '',
      };

      const response = await request
        .default(app.getHttpServer())
        .post(`/api/categories/${user.id}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });

    it('should return 400 Bad Request if userId is not a number', async () => {
      const payload: CreateCategoryDTO = {
        name: 'test category',
      };

      const response = await request
        .default(app.getHttpServer())
        .post('/api/categories/invalid')
        .send(payload);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/categories/:userId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should successfully get all categories for a user and return 200', async () => {
      // Create a user first
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      // Create some categories for the user
      await testService.createCategory({
        name: 'Food',
        userId: user.id,
      });

      await testService.createCategory({
        name: 'Transport',
        userId: user.id,
      });

      const response = await request
        .default(app.getHttpServer())
        .get(`/api/categories/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toBeDefined();
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBe(2);
      expect(response.body.categories[0].name).toMatch(/Food|Transport/);
    });

    it('should return empty array when user has no categories', async () => {
      // Create a user first
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      const response = await request
        .default(app.getHttpServer())
        .get(`/api/categories/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toBeDefined();
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBe(0);
    });

    it('should return 400 Bad Request if userId is not a number', async () => {
      const response = await request
        .default(app.getHttpServer())
        .get('/api/categories/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/categories/:userId/:categoryId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should successfully update a category and return 200', async () => {
      // Create a user first
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      // Create a category to update
      const category = await testService.createCategory({
        name: 'Food',
        userId: user.id,
      });

      const updateData = {
        name: 'Food & Dining',
      };

      const response = await request
        .default(app.getHttpServer())
        .patch(`/api/categories/${user.id}/${category.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(category.id);
      expect(response.body.name).toBe('Food & Dining');
    });

    it('should return 400 Bad Request if payload is invalid', async () => {
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      const category = await testService.createCategory({
        name: 'Food',
        userId: user.id,
      });

      const invalidPayload = {
        name: '',
      };

      const response = await request
        .default(app.getHttpServer())
        .patch(`/api/categories/${user.id}/${category.id}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
    });

    it('should return 400 Bad Request if userId is not a number', async () => {
      const response = await request
        .default(app.getHttpServer())
        .patch('/api/categories/invalid/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
    });

    it('should return 400 Bad Request if categoryId is not a number', async () => {
      const response = await request
        .default(app.getHttpServer())
        .patch('/api/categories/1/invalid')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if category does not exist', async () => {
      const user = await testService.createUser({
        username: 'test user',
        password: 'password123',
      });

      const response = await request
        .default(app.getHttpServer())
        .patch(`/api/categories/${user.id}/999`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
    });
  });
});
