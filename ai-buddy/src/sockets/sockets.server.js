const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie'); // cookie and cookie-parser are different packages
// cookie is a simple parser, while cookie-parser is middleware for Express
// that uses the cookie package internally.
const agent = require('../agent/agent.js')
async function initSocketServer(httpServer) {

    // Allow origins from environment variable ALLOWED_ORIGINS (comma-separated), fallback to common dev ports
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    console.log('Socket allowed origins:', allowedOrigins);

    const io = new Server(httpServer,{
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    io.use((socket, next) => {
        const cookies=cookie.parse(socket.handshake.headers?.cookie || '');
        const { token } = cookies;


        if(!token){ // if no token  false -->!false = true 
            return next(new Error('Authentication error'));
        }
        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // replace 'your_jwt_secret' with your actual secret
            socket.user = decoded; // attach user info to socket object
            socket.token = token;
            next();

        }catch(err){
            return next(new Error('Authentication error'));
        }
    })





    io.on('connection', (socket) => {
        console.log(socket.user, socket.token)
socket.on('message',async(msg)=>{
    console.log('Message from user:', socket.user.id, msg);
    const agentResponse = await  agent.invoke({
        messages:[{
            role:'user',content:msg
        }]
    },{metadata:{token:socket.token}})
   const lastMessage = agentResponse.messages[agentResponse.messages.length-1]
   socket.emit('message',lastMessage.content)
})
        console.log('a user connected');
    });
}
module.exports = { initSocketServer };