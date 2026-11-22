import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    // Use ephemeral port 0 for clean test isolation
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

describe('1. Health Check Endpoint', () => {
  test('GET /health returns 200 and healthy database status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.status, 'healthy');
    assert.equal(body.database.type, 'MySQL');
    assert.equal(body.database.status, 'connected');
  });
});

describe('2. Authentication Flow & Validation', () => {
  test('POST /auth/login with valid demo student credentials returns token and sanitized user', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.student@campus.edu',
        password: 'StudentPass123!',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, 'demo.student@campus.edu');
    assert.equal(body.data.user.role, 'student');
    assert.equal(body.data.user.password_hash, undefined);
  });

  test('POST /auth/login with invalid password returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.student@campus.edu',
        password: 'WrongPassword!',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('POST /auth/login with invalid email format returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'AnyPassword123!',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'BAD_REQUEST');
    assert.ok(body.error.details.some((d) => d.field === 'email'));
  });

  test('POST /auth/register creates a new student user and returns JWT', async () => {
    const testEmail = `test.student.${Date.now()}@campus.edu`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'NewStudentPass123!',
        full_name: 'Test Student User',
        student_id: 'STU-TEST-999',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, testEmail);
    assert.equal(body.data.user.role, 'student');
  });

  test('POST /auth/register prevents duplicate email registrations (409 Conflict)', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.student@campus.edu',
        password: 'NewStudentPass123!',
        full_name: 'Duplicate Student',
      }),
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
  });
});

describe('3. Protected Routes & Authorization', () => {
  let studentToken;
  let adminToken;
  let operatorToken;

  before(async () => {
    // Obtain student token
    const studentRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo.student@campus.edu', password: 'StudentPass123!' }),
    });
    const studentData = await studentRes.json();
    studentToken = studentData.data.token;

    // Obtain admin token
    const adminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo.admin@campus.edu', password: 'AdminPass123!' }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.data.token;

    // Obtain operator token
    const opRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo.canteen@campus.edu', password: 'OperatorPass123!' }),
    });
    const opData = await opRes.json();
    operatorToken = opData.data.token;
  });

  test('GET /auth/me returns 401 when no token is provided', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('GET /auth/me returns authenticated student profile with valid token', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'demo.student@campus.edu');
    assert.equal(body.data.user.role, 'student');
  });

  test('GET /users (Admin only) returns 403 Forbidden for Student role', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('GET /users (Admin only) returns 403 Forbidden for Operator role', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('GET /users (Admin only) returns 200 and user listing for Admin role', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.users));
    assert.ok(body.data.users.length >= 4);
    assert.ok(body.data.pagination);
  });
});
