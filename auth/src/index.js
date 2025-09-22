const express = require('express')
const app =  express()
const cookieParser = require('cookie-parser')
const auth = require('./router/auth.router.js')
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth',auth)




module.exports = app