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
});
