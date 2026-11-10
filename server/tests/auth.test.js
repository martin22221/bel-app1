import { before, after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

// The npm test script loads .env.test before this file is evaluated.
process.env.JWT_SECRET ||= 'test-only-jwt-secret-change-me';

const [{ default: app }, { default: prisma }] = await Promise.all([
  import('../src/app.js'),
  import('../src/lib/prisma.js'),
]);

const testEmail = 'auth-automation-test@example.com';
const testPassword = 'Password123';

let token;

function assertNoPasswordHash(body) {
  assert.equal(JSON.stringify(body).includes('passwordHash'), false);
}

before(async () => {
  // This suite MUST use a dedicated test database configured in .env.test.
  // Clear users from that test database before running the scenarios.
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Authentication API', () => {
  test('1. Successful registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: testPassword });

    assert.equal(response.status, 201);
    assert.ok(response.body.token);
    assert.equal(response.body.user.email, testEmail);
    assertNoPasswordHash(response.body);
    token = response.body.token;
  });

  test('2. Existing email returns 409', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Another User', email: testEmail, password: testPassword });

    assert.equal(response.status, 409);
    assertNoPasswordHash(response.body);
  });

  test('3. Short password returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'short-password@example.com', password: '123' });

    assert.equal(response.status, 400);
    assertNoPasswordHash(response.body);
  });

  test('4. Successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    assert.equal(response.status, 200);
    assert.ok(response.body.token);
    assert.equal(response.body.user.email, testEmail);
    assertNoPasswordHash(response.body);
    token = response.body.token;
  });

  test('5. Wrong password returns 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword123' });

    assert.equal(response.status, 401);
    assertNoPasswordHash(response.body);
  });

  test('6. GET /me with token returns the user', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, testEmail);
    assertNoPasswordHash(response.body);
  });

  test('7. GET /me without token returns 401', async () => {
    const response = await request(app).get('/api/auth/me');

    assert.equal(response.status, 401);
    assertNoPasswordHash(response.body);
  });
});
