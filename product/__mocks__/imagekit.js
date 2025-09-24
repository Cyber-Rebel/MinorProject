// Mock ImageKit for testing
class MockImageKit {
  constructor(options) {
    this.publicKey = options.publicKey
    this.privateKey = options.privateKey
    this.urlEndpoint = options.urlEndpoint
  }

  upload(options) {
    return Promise.resolve({
      fileId: 'mock-file-id-' + Date.now(),
      name: options.fileName || 'mock-image.jpg',
      url: 'https://mock-imagekit-url.com/mock-image.jpg',
      thumbnailUrl: 'https://mock-imagekit-url.com/tr:w-200,h-200/mock-image.jpg',
      height: 800,
      width: 1200,
      size: options.file ? options.file.length : 1024,
      filePath: '/mock-folder/mock-image.jpg'
    })
  }

  deleteFile(fileId) {
    return Promise.resolve({
      status: 'success'
    })
  }
}

module.exports = MockImageKit