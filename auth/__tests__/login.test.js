const request = require('supertest')
const mongoose = require('mongoose')
const User = require('../src/Models/user.models')
const app = require('../src/index')
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongod; // Keep reference so we can stop it
beforeAll(async () => {
  // test/setup.js will handle mongodb connection
  mongod = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'testsecret';
 
 
 const uri = mongod.getUri();
 
   await mongoose.connect(uri);
   console.log('Mongo Memory Server started at:', uri);
})

afterEach(async () => {
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
    if (mongod) await mongod.stop();
})

test('login succeeds with valid credentials', async () => {
  const pw = 'password123'
  const bcrypt = require('bcryptjs')
  const hashed = await bcrypt.hash(pw, 10)
  await User.create({ username: 'testuser', email: 'test@example.com', password: hashed, fullName: { firstName: 'T', lastName: 'User' } })

  const res = await request(app).post('/api/auth/login').send({ username: 'testuser', password: pw })
  expect(res.status).toBe(200)
  expect(res.body.user).toBeDefined()
  expect(res.body.user.username).toBe('testuser')
})

test('login fails with invalid credentials', async () => {
  await User.create({ username: 'wrong', email: 'wrong@example.com', password: 'x', fullName: { firstName: 'W', lastName: 'User' } })
  const res = await request(app).post('/api/auth/login').send({ username: 'wrong', password: 'bad' })
  expect(res.status).toBe(401)
})
