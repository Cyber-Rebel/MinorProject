const moongose = require('mongoose')

async function connectdb() {
    try{
    await moongose.connect(process.env.MONGO_URL)
    console.log("Database connected");
    }
    catch(err){
        console.log("Mongodb error ", err);
    }
}

module.exports = connectdb;