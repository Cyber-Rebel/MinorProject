const express = require('express')
const router = express.Router()
const authcontroller = require('../controllers/auth.controller.js')
const validator = require('../Middlware/validator.middlware.js')
const authmiddleware = require('../Middlware/auth.middlware.js') 

// POST /api/auth/register
router.post('/register',validator.registerValidator, authcontroller.register)

// POST /api/auth/login
router.post('/login', validator.loginValidator ,authcontroller.login)

// GET /api/auth/me
router.get('/me',authmiddleware,authcontroller.getcurrentuser)


// GET /api/auth/logout
// router.get('/logout',authcontroller.logoutUser)

module.exports = router;