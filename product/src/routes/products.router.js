const express = require('express');
const router = express.Router();
const { createProductValidation } = require('../middlewares/product.validation.js');
const productController = require('../controllers/products.controller.js');
const multer = require('multer');
const { createauthMiddleware } = require('../middlewares/auth.middlewares.js');
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for simplicity

// Validation rules are moved to middleware: ../middlewares/product.validation.js

router.post('/', createauthMiddleware(['admin', 'seller']), upload.array('images', 5), createProductValidation, productController.createProduct);
router.get('/', productController.getProducts);
router.patch('/:id', createauthMiddleware(['seller']), productController.updateProduct);
router.delete('/:id', createauthMiddleware(['seller']), productController.deleteProduct);
router.get('/seller', createauthMiddleware(['seller']), productController.getProductsBySeller);
router.get('/:id', productController.getProductById); // Keep this at the end to avoid conflicts

module.exports = router;