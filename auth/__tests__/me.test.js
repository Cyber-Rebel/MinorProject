const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../src/index')
const mongoose = require('mongoose')
const User = require('../src/Models/user.models')
const {MongoMemoryServer} = require('mongodb-memory-server')


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





test('GET /api/auth/me returns current user when valid token cookie provided', async () => {
  const hashed = await bcrypt.hash('password123', 10)
  const user = await User.create({
    username: 'meuser',
    email: 'me@example.com',
    password: hashed,
    fullName: { firstName: 'Me', lastName: 'User' }
  })

  const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET)

  const res = await request(app).get('/api/auth/me').set('Cookie', [`token=${token}`])

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body.user).toBeDefined()
  expect(res.body.user.username).toBe('meuser')
  expect(res.body.user.email).toBe('me@example.com')
})

test('GET /api/auth/me returns 401 when no token cookie provided', async () => {
  const res = await request(app).get('/api/auth/me')
  expect(res.status).toBe(401)
})

    test('GET /api/auth/me returns 401 for invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', ['token=invalid.token'])
    expect(res.status).toBe(401)
    })
