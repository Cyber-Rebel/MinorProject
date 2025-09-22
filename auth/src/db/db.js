const mongoose = require('mongoose');

const ConnectdDabse = async () =>  {    
    await mongoose.connect(process.env.MONGO_URI).then(() => {
        console.warn('Database connected');
        

    }).catch((err) => {
        console.log('Database connection failed');
        console.warn(err);
    });

}
module.exports = ConnectdDabse;