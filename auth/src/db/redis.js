// During tests we don't want to open a real Redis connection (it creates
// sockets that keep Jest from exiting). If NODE_ENV === 'test' or
// DISABLE_REDIS is set, export a tiny in-memory mock with the same API used
// in this project (set, get, on).
if (process.env.NODE_ENV === 'test' || process.env.DISABLE_REDIS === 'true') { //  || process.env.DISABLE_REDIS === 'true'  ye hamne isliye dala hae ki jab ham test kar rahe hote hae to hamara real redis server open na ho jaye 
    console.log('Using mock Redis client')
    // Simple in-memory mock
    // Note: this will not persist between test files, but is good enough for our needs
    // Only implements the methods we use in the app (set, get, on, quit)
    const store = new Map()
    const mock = {
        async set(key, value, ...args) {
            // support: set(key, value, 'EX', seconds)
            store.set(key, String(value))
            return 'OK'
        },
        async get(key) {
            return store.has(key) ? store.get(key) : null
        },
        on() {},
        quit: async () => {},
    }
    module.exports = mock
} else {
    const { Redis } = require('ioredis')

    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    })

    redis.on('connect', () => {
        console.log('Connected to Redis')
    })

    module.exports = redis
}




// npm i ioredis 
// redis hae database hota hae jo value store karta in RAM memory me ye data ko bahut fast access kar leta hae because wo ram me store karte 
// Ek baad dyan rakna ki ye data ram me store hota hae to agar redis ka  server restart ho jata hae to sara data chala jata hae
// REDIS ME SIRF KEY VALUE PAIR ME DATA STORE HOTA HAE