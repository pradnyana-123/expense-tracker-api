import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Sesuaikan path
import { CreateUserDTO } from 'src/dto/user-dto';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let testService: TestService;
  // Setup sebelum testing dimulai
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // PENTING: Aktifkan pipe agar DTO di-validate seperti di aplikasi asli
    app.useGlobalPipes(new ValidationPipe());

    testService = moduleFixture.get<TestService>(TestService);

    await app.init();
  });


  afterAll(async () => {
    await app.close();
  });

  describe('api/users (POST)', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    afterEach(async () => {
      await testService.deleteAll();
    });
    it('should successfully create a new user and return 201', async () => {
      const payload: CreateUserDTO = {
        username: 'test user',
        password: 'securePassword123',
      };

      const response = await request
        .default(app.getHttpServer())
        .post('/api/users')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.username).toBe('test user');
    });

    it('should return 400 Bad Request if payload is invalid', async () => {
      const invalidPayload = {
        username: '',
        password: '', 
      };

      const response = await request
        .default(app.getHttpServer())
        .post('/api/users')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });
  });
});
