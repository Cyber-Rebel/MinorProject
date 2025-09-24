const express = require('express');
const cookieParser = require('cookie-parser');
const productRouter = require('./Routes/product.routes.js')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/products', productRouter)


module.exports = app;