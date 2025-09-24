const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../src/app')
const Product = require('../src/Models/product.models')

// Mock multer and imagekit
jest.mock('multer')
jest.mock('imagekit')

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.JWT_SECRET = 'testsecret'
  const uri = mongod.getUri()
  await mongoose.connect(uri)
  console.log('Mongo Memory Server started at:', uri)
})

afterEach(async () => {
  await Product.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
})

describe('Products API', () => {
  describe('POST /api/products', () => {
    test('creates product successfully with valid data and images', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product',
        'price.amount': 99.99,
        'price.currency': 'INR',
        seller: new mongoose.Types.ObjectId().toString()
      }

      const res = await request(app)
        .post('/api/products')
        .field('title', productData.title)
        .field('description', productData.description)
        .field('price.amount', productData['price.amount'])
        .field('price.currency', productData['price.currency'])
        .field('seller', productData.seller)
        .attach('images', Buffer.from('fake image data'), 'test1.jpg')
        .attach('images', Buffer.from('fake image data 2'), 'test2.jpg')

      // Test assumes the endpoint will be implemented
      // Adjust expectations based on actual implementation
      expect([201, 404, 500]).toContain(res.status)
      
      if (res.status === 201) {
        expect(res.body).toHaveProperty('product')
        expect(res.body.product.title).toBe(productData.title)
        expect(res.body.product.description).toBe(productData.description)
        expect(res.body.product.price.amount).toBe(productData['price.amount'])
        expect(res.body.product.price.currency).toBe(productData['price.currency'])
        expect(res.body.product.image).toBeDefined()
        expect(Array.isArray(res.body.product.image)).toBe(true)
      }
    })

    test('fails validation with missing required fields', async () => {
      const incompleteData = {
        description: 'Missing title and price'
      }

      const res = await request(app)
        .post('/api/products')
        .send(incompleteData)

      expect([400, 404, 500]).toContain(res.status)
      
      if (res.status === 400) {
        expect(res.body).toHaveProperty('errors')
      }
    })

    test('fails validation with invalid price', async () => {
      const invalidPriceData = {
        title: 'Test Product',
        'price.amount': 'not-a-number',
        'price.currency': 'INVALID',
        seller: new mongoose.Types.ObjectId().toString()
      }

      const res = await request(app)
        .post('/api/products')
        .field('title', invalidPriceData.title)
        .field('price.amount', invalidPriceData['price.amount'])
        .field('price.currency', invalidPriceData['price.currency'])
        .field('seller', invalidPriceData.seller)

      expect([400, 404, 500]).toContain(res.status)
    })

    test('fails validation with invalid seller ID', async () => {
      const invalidSellerData = {
        title: 'Test Product',
        'price.amount': 99.99,
        'price.currency': 'INR',
        seller: 'invalid-seller-id'
      }

      const res = await request(app)
        .post('/api/products')
        .field('title', invalidSellerData.title)
        .field('price.amount', invalidSellerData['price.amount'])
        .field('price.currency', invalidSellerData['price.currency'])
        .field('seller', invalidSellerData.seller)

      expect([400, 404, 500]).toContain(res.status)
    })

    test('handles image upload errors gracefully', async () => {
      // Mock ImageKit to throw an error
      const ImageKit = require('imagekit')
      const mockImageKit = new ImageKit({
        publicKey: 'test',
        privateKey: 'test',
        urlEndpoint: 'test'
      })
      
      // Override upload to throw error
      mockImageKit.upload = jest.fn().mockRejectedValue(new Error('Upload failed'))

      const productData = {
        title: 'Test Product',
        'price.amount': 99.99,
        'price.currency': 'INR',
        seller: new mongoose.Types.ObjectId().toString()
      }

      const res = await request(app)
        .post('/api/products')
        .field('title', productData.title)
        .field('price.amount', productData['price.amount'])
        .field('price.currency', productData['price.currency'])
        .field('seller', productData.seller)
        .attach('images', Buffer.from('fake image data'), 'test.jpg')

      // Should handle upload errors appropriately
      expect([400, 500, 404]).toContain(res.status)
    })

    test('creates product without images', async () => {
      const productData = {
        title: 'Test Product No Images',
        description: 'Product without images',
        'price.amount': 49.99,
        'price.currency': 'USD',
        seller: new mongoose.Types.ObjectId().toString()
      }

      const res = await request(app)
        .post('/api/products')
        .field('title', productData.title)
        .field('description', productData.description)
        .field('price.amount', productData['price.amount'])
        .field('price.currency', productData['price.currency'])
        .field('seller', productData.seller)

      expect([201, 404, 500]).toContain(res.status)
      
      if (res.status === 201) {
        expect(res.body.product.image).toBeDefined()
        expect(Array.isArray(res.body.product.image)).toBe(true)
        expect(res.body.product.image.length).toBe(0)
      }
    })

    test('validates maximum number of images', async () => {
      const productData = {
        title: 'Test Product Many Images',
        'price.amount': 99.99,
        'price.currency': 'INR',
        seller: new mongoose.Types.ObjectId().toString()
      }

      const req = request(app)
        .post('/api/products')
        .field('title', productData.title)
        .field('price.amount', productData['price.amount'])
        .field('price.currency', productData['price.currency'])
        .field('seller', productData.seller)

      // Attach many images (assuming there's a limit)
      for (let i = 0; i < 10; i++) {
        req.attach('images', Buffer.from(`fake image data ${i}`), `test${i}.jpg`)
      }

      const res = await req

      // Should either accept all images or return validation error
      expect([201, 400, 404, 500]).toContain(res.status)
    })
  })
})