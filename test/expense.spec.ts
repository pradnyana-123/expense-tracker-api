import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('ExpenseController', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes();
    testService = moduleFixture.get<TestService>(TestService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/expense/:userId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should return all expenses for a user', async () => {
      // First create a user
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      // Create multiple expenses
      await request(app.getHttpServer()).post(`/api/expense/${userId}`).send({
        description: 'Expense 1',
        amount: '100.00',
      });

      await request(app.getHttpServer()).post(`/api/expense/${userId}`).send({
        description: 'Expense 2',
        amount: '200.50',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/expense/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return empty array for user with no expenses', async () => {
      // First create a user
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/expense/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).get('/api/expense/10000').expect(404);
    });

    it('should return 400 for invalid userId', async () => {
      await request(app.getHttpServer())
        .get('/api/expense/invalid')
        .expect(400);
    });
  });

  describe('POST /api/expense/:userId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should create an expense successfully', async () => {
      // First create a user
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseData = {
        description: 'Test expense',
        amount: '50.00',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(expenseData.description);
      expect(response.body.amount).toBe('5000');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create expense with Rupiah format', async () => {
      // First create a user
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser2',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseData = {
        description: 'Test expense with Rupiah',
        amount: '1.234,56',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(expenseData.description);
    });

    it('should return 404 for non-existent user', async () => {
      const expenseData = {
        description: 'Test expense',
        amount: '50.00',
      };

      await request(app.getHttpServer())
        .post('/api/expense/99999')
        .send(expenseData)
        .expect(404);
    });

    it('should return 400 for invalid userId', async () => {
      const expenseData = {
        description: 'Test expense',
        amount: '50.00',
      };

      await request(app.getHttpServer())
        .post('/api/expense/invalid')
        .send(expenseData)
        .expect(400);
    });
  });
});
