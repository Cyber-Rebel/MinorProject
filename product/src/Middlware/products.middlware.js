const jwt= require('jsonwebtoken')
const User = require('../Models/user.models.js')


function  createAuthMiddleware(role=['user']){
    return async function authMiddleware(req,res,next){
        try{
            const token = req.cookies.token
            if(!token){
                return res.status(401).json({message:"Unauthorized"})
            }
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            if(!decoded){
                return res.status(401).json({message:"Unauthorized"})
            }
            const user = await User.findById(decoded.id)
            if(!user){
                return res.status(401).json({message:"Unauthorized"})
            }
            req.user = user
            next()
        }catch(err){
            return res.status(401).json({message:"Unauthorized"})
        }
    }
}