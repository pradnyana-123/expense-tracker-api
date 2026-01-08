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
