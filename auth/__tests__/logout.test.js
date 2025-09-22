const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../src/index')
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

test('GET /api/auth/logout clears cookie and returns 200 when token present', async () => {
  const hashed = await bcrypt.hash('password123', 10)
  const user = await User.create({
    username: 'logoutuser',
    email: 'logout@example.com',
    password: hashed,
    fullName: { firstName: 'Log', lastName: 'Out' }
  })

  const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET)

  const res = await request(app).get('/api/auth/logout').set('Cookie', [`token=${token}`])
  expect(res.status).toBe(200)
  // cookie should be cleared (Set-Cookie header will include token=; Max-Age/Expires)
  const setCookie = res.headers['set-cookie'] || []
  const hasCleared = setCookie.some(c => c.includes('token=') && (c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0') || c.includes('token=;')))
  expect(hasCleared).toBe(true)
})

test('GET /api/auth/logout returns 400 when no token provided', async () => {
  const res = await request(app).get('/api/auth/logout')
  expect(res.status).toBe(400)
})
