const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/index');
const User = require('../src/Models/user.models');

let mongod; // Keep reference so we can stop it

beforeAll(async () => {
// This will create an new instance of "MongoMemoryServer" and automatically start it
 mongod = await MongoMemoryServer.create();
 process.env.JWT_SECRET = 'testsecret';


const uri = mongod.getUri();

  await mongoose.connect(uri);
  console.log('Mongo Memory Server started at:', uri);
});

// Clear DB between tests
afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('registers a new user successfully', async () => {
  const payload = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    fullName: { firstName: 'Alice', lastName: 'Doe' },
  };

  const res = await request(app).post('/api/auth/register').send(payload);

  expect(res.status).toBe(201);
  expect(res.body.user).toBeDefined();
  expect(res.body.user.username).toBe('alice');
  expect(res.body.user.email).toBe('alice@example.com');
  // password should not be returned
  expect(res.body.user.password).toBeUndefined();
});

test('returns 409 when user already exists', async () => {
  await User.create({
    username: 'bob',
    email: 'bob@example.com',
    password: 'x',
    fullName: { firstName: 'Bob', lastName: 'Smith' },
  });

  const payload = {
    username: 'bob',
    email: 'bob@example.com',
    password: 'password',
    fullName: { firstName: 'Bob', lastName: 'Smith' },
  };

  const res = await request(app).post('/api/auth/register').send(payload);

  expect(res.status).toBe(409);
});

test('returns 400 for invalid input', async () => {
  const payload = {
    username: 'al', // too short
    email: 'invalid-email',
    password: '123', // too short
    fullName: { firstName: '', lastName: '' }, // empty names
  };

  const res = await request(app).post('/api/auth/register').send(payload);

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  expect(res.body.errors.length).toBeGreaterThan(0);
});
