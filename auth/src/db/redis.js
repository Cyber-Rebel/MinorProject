const { Redis }= require('ioredis')

const redis = new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
})

redis.on('connect',()=>{
    console.log('Connected to Redis');
})
// redis.on('error',(err)=>{
//     console.log('Redis error',err);
// })

module.exports=redis




















// npm i ioredis 
// redis hae database hota hae jo value store karta in RAM memory me ye data ko bahut fast access kar leta hae because wo ram me store karte 
// Ek baad dyan rakna ki ye data ram me store hota hae to agar redis ka  server restart ho jata hae to sara data chala jata hae
// REDIS ME SIRF KEY VALUE PAIR ME DATA STORE HOTA HAE