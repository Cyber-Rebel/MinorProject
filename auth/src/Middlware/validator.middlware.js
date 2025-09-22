const {body,validationResult} = require('express-validator')

     
const respondWithUserValidator = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next()
}
const registerValidator = [ 
    body('username').isString().isLength({min:3}).notEmpty().withMessage('Username is required min 3 char'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
    body('fullName.firstName').notEmpty().withMessage('First name is required'),
    body('fullName.lastName').notEmpty().withMessage('Last name is required'),
    respondWithUserValidator  // jise jise error hone wo ek arry me save honge and errors me kuch hae to show but erro.isEmpty  kar false kuch data nahi empty hae to next call hoga and repose send hoga 
]

const loginValidator = [
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('username').optional().isString().isLength({min:3}).withMessage('Username must be at least 3 characters long'),
    body('password').notEmpty().withMessage('Password is required'),
    (req,res,next) => {
        if(!req.body.email && !req.body.username){
            return res.status(400).json({message:'Either email or username is required'})
        }
        next()
    },
    respondWithUserValidator 
]   

const addressValidator = [
    body('street').notEmpty().withMessage('Street is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('zip').isNumeric().withMessage('Zip must be a number'),
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
    respondWithUserValidator    
]

module.exports = {registerValidator,loginValidator,addressValidator}   