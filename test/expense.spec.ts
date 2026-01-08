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

  describe('PATCH /api/expense/:userId/:expenseId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should update expense successfully', async () => {
      // Create user and expense
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send({
          description: 'Original expense',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Update expense
      const updateData = {
        description: 'Updated expense',
        amount: '150.50',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/expense/${userId}/${expenseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(updateData.description);
    });

    it('should update only description when amount not provided', async () => {
      // Create user and expense
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send({
          description: 'Original expense',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Update only description
      const updateData = {
        description: 'Updated description only',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/expense/${userId}/${expenseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
    });

    it('should update with Rupiah format amount', async () => {
      // Create user and expense
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send({
          description: 'Original expense',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Update with Rupiah format
      const updateData = {
        amount: '2.500,75',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/expense/${userId}/${expenseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 404 for non-existent expense', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      await request(app.getHttpServer())
        .patch(`/api/expense/${userId}/99999`)
        .send({
          description: 'Updated expense',
          amount: '150.50',
        })
        .expect(404);
    });

    it('should return 403 when updating other user expense', async () => {
      // Create two users
      const user1Response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'user1',
          password: 'password123',
        });

      const user2Response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'user2',
          password: 'password123',
        });

      const user1Id = user1Response.body.id;
      const user2Id = user2Response.body.id;

      // Create expense for user1
      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${user1Id}`)
        .send({
          description: 'User1 expense',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Try to update user1's expense with user2's ID
      await request(app.getHttpServer())
        .patch(`/api/expense/${user2Id}/${expenseId}`)
        .send({
          description: 'Hacked expense',
          amount: '999.99',
        })
        .expect(403);
    });

    it('should return 400 for invalid userId or expenseId', async () => {
      await request(app.getHttpServer())
        .patch('/api/expense/invalid/1')
        .send({
          description: 'Updated expense',
          amount: '150.50',
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch('/api/expense/1/invalid')
        .send({
          description: 'Updated expense',
          amount: '150.50',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/expense/:userId/:expenseId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should delete expense successfully', async () => {
      // Create user and expense
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send({
          description: 'Expense to delete',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Delete expense
      const response = await request(app.getHttpServer())
        .delete(`/api/expense/${userId}/${expenseId}`)
        .expect(200);

      expect(response.body.message).toBe('Expense deleted successfully');
      // Verify expense is deleted
      await request(app.getHttpServer())
        .patch(`/api/expense/${userId}/${expenseId}`)
        .send({
          description: 'Should fail',
          amount: '50.00',
        })
        .expect(404);
    });

    it('should return 404 for non-existent expense', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/expense/${userId}/99999`)
        .expect(404);
    });

    it('should return 403 when deleting other user expense', async () => {
      // Create two users
      const user1Response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'user1',
          password: 'password123',
        });

      const user2Response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'user2',
          password: 'password123',
        });

      const user1Id = user1Response.body.id;
      const user2Id = user2Response.body.id;

      // Create expense for user1
      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${user1Id}`)
        .send({
          description: 'User1 expense',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Try to delete user1's expense with user2's ID
      await request(app.getHttpServer())
        .delete(`/api/expense/${user2Id}/${expenseId}`)
        .expect(403);

      // Verify expense still exists for user1
      await request(app.getHttpServer())
        .patch(`/api/expense/${user1Id}/${expenseId}`)
        .send({
          description: 'Should work',
          amount: '150.00',
        })
        .expect(200);
    });

    it('should return 400 for invalid userId or expenseId', async () => {
      await request(app.getHttpServer())
        .delete('/api/expense/invalid/1')
        .expect(400);

      await request(app.getHttpServer())
        .delete('/api/expense/1/invalid')
        .expect(400);
    });

    it('should verify expense is actually deleted from database', async () => {
      // Create user and expense
      const userResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const userId = userResponse.body.id;

      const expenseResponse = await request(app.getHttpServer())
        .post(`/api/expense/${userId}`)
        .send({
          description: 'Expense to delete',
          amount: '100.00',
        });

      const expenseId = expenseResponse.body.id;

      // Verify expense exists in getAll
      const getAllBefore = await request(app.getHttpServer())
        .get(`/api/expense/${userId}`)
        .expect(200);

      expect(getAllBefore.body).toHaveLength(1);

      // Delete expense
      await request(app.getHttpServer())
        .delete(`/api/expense/${userId}/${expenseId}`)
        .expect(200);

      // Verify expense is gone from getAll
      const getAllAfter = await request(app.getHttpServer())
        .get(`/api/expense/${userId}`)
        .expect(200);

      expect(getAllAfter.body).toHaveLength(0);
    });
  });
});
