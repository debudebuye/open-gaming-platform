import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `e2e-${Date.now()}@test.com`,
    username: `e2euser${Date.now()}`,
    password: 'testpass123',
  };

  describe('Auth', () => {
    it('POST /v1/auth/register', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.expiresIn).toBe(900);
        });
    });

    it('POST /v1/auth/login', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('POST /v1/auth/login - invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: testUser.email, password: 'wrong' })
        .expect(401);
    });

    it('GET /v1/users - requires auth', () => {
      return request(app.getHttpServer())
        .get('/v1/users')
        .expect(401);
    });
  });
});
