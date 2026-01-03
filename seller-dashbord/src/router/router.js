const express = require('express');
const createauthMiddleware = require('../middleware/auth.middleware');
const controller = require('../controller/selller.controller.js');
const router = express.Router();

// Dashboard metrics
router.get('/matrics', createauthMiddleware(['seller']), controller.getMatrics);

// Orders routes
router.get('/orders', createauthMiddleware(['seller']), controller.getOrder);
router.get('/orders/:orderId', createauthMiddleware(['seller']), controller.getOrderById);
router.patch('/orders/:orderId/status', createauthMiddleware(['seller']), controller.updateOrderStatus);

// Products route
router.get('/products', createauthMiddleware(['seller']), controller.getProducts);

module.exports = router;