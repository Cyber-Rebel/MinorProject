const app = require('./src/app.js')
require('dotenv').config()
const connectdb = require('./src/db/db.js')


connectdb()









app.listen(3001, () => {
    console.log("Server is running at port 3001");
})