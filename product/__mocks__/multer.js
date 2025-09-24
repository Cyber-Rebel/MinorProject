// Mock multer for testing
const multer = {
  memoryStorage: jest.fn(() => ({})),
  single: jest.fn((fieldname) => {
    return (req, res, next) => {
      // Mock file object
      req.file = {
        fieldname: fieldname,
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
        size: 1024
      }
      next()
    }
  }),
  array: jest.fn((fieldname, maxCount) => {
    return (req, res, next) => {
      // Mock files array
      req.files = [
        {
          fieldname: fieldname,
          originalname: 'test-image1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data 1'),
          size: 1024
        },
        {
          fieldname: fieldname,
          originalname: 'test-image2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image data 2'),
          size: 2048
        }
      ]
      next()
    }
  })
}

module.exports = multer