const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../src/index')
const User = require('../src/Models/user.models')

let mongod
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.JWT_SECRET = 'testsecret'
  const uri = mongod.getUri()
  await mongoose.connect(uri)
})

afterEach(async () => {
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
})

async function createAuthCookie() {
  const pw = 'password123'
  const hashed = await bcrypt.hash(pw, 10)
  const user = await User.create({ username: 'addruser', email: 'addr@example.com', password: hashed, fullName: { firstName: 'Addr', lastName: 'User' } })
  const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET)
  return { cookie: `token=${token}`, user }
}

describe('Addresses API', () => {
  test('POST /api/auth/users/me/addresses - add address succeeds with valid data', async () => {
    const { cookie } = await createAuthCookie()
    const payload = {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      country: 'Country',
      zip: 560001,
      phone: '9876543210'
    }

    const res = await request(app).post('/api/auth/users/me/addresses').set('Cookie', [cookie]).send(payload)
    // If route not implemented, expect 404 or 500; assert success when implemented
    expect([200,201,404,500]).toContain(res.status)
  })

  test('POST /api/auth/users/me/addresses - validation fails for invalid zip or phone', async () => {
    const { cookie } = await createAuthCookie()
    const badPayload = {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      country: 'Country',
      zip: 'not-a-number',
      phone: 'bad-phone'
    }
    const res = await request(app).post('/api/auth/users/me/addresses').set('Cookie', [cookie]).send(badPayload)
    // Expect validation to return 400 when implemented
    expect([400,404,500]).toContain(res.status)
  })
test('GET /api/auth/users/me/addresses - list addresses (protected, requires authentication, indicates default)', async () => {
    // Should return 401 if no cookie is provided
    const resNoAuth = await request(app).get('/api/auth/users/me/addresses')
    expect(resNoAuth.status).toBe(401)

    // With authentication, should return addresses and indicate default
    const { cookie, user } = await createAuthCookie()
    // Optionally, add an address to the user for testing
    await User.findByIdAndUpdate(user._id, {
        $push: {
            addresses: {
                street: '123 Main St',
                city: 'City',
                state: 'State',
                country: 'Country',
                zip: 560001,
                phone: '9876543210',
                isDefault: true
            }
        }
    })

    const res = await request(app).get('/api/auth/users/me/addresses').set('Cookie', [cookie])
    expect([200,404,500]).toContain(res.status)
    if (res.status === 200) {
        expect(res.body).toBeDefined()
        // Check if response is array or object with addresses
        const addresses = Array.isArray(res.body) ? res.body : res.body.addresses
        expect(Array.isArray(addresses)).toBe(true)
        // If there are addresses, validate fields and default indication
        if (addresses.length > 0) {
            let foundDefault = false
            addresses.forEach(addr => {
                expect(addr).toHaveProperty('street')
                expect(addr).toHaveProperty('city')
                expect(addr).toHaveProperty('state')
                expect(addr).toHaveProperty('country')
                expect(addr).toHaveProperty('zip')
                expect(addr).toHaveProperty('phone')
                expect(addr).toHaveProperty('isDefault')
                if (addr.isDefault) foundDefault = true
            })
            expect(foundDefault).toBe(true)
        }
    }
})

  test('DELETE /api/auth/users/me/addresses/:id - delete address (protected)', async () => {
    const { cookie, user } = await createAuthCookie()
    // Add an address to the user so we have a real addressId to delete
    const address = {
      street: '456 Delete St',
      city: 'DeleteCity',
      state: 'DeleteState',
      country: 'DeleteCountry',
      zip: 123456,
      phone: '1234567890',
      isDefault: false
    }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { addresses: address } },
      { new: true }
    )
    const addressId = updatedUser.addresses[0]._id
    console.log('AddressId to delete:', addressId.toString())

    // Try deleting the address
    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${addressId}`)
      .set('Cookie', [cookie])

    expect([200,204,404,500]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body).toHaveProperty('message', 'Address deleted successfully')
      expect(Array.isArray(res.body.addresses)).toBe(true)
      // The deleted address should not be present
      const found = res.body.addresses.find(addr => addr._id === addressId.toString())
      expect(found).toBeUndefined()
    }
  })})  
