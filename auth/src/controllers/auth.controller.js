const UserModel = require("../Models/user.models.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis.js");
 const register = async (req, res) => {
  try {
    const { username, email, password, fullName:{firstName,lastName} } = req.body
    // Check if user already exists
        // In MongoDB, the $or operator is used when you want to match documents that satisfy at least one condition from multiple conditions.
        const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] }) //  dhoni paki ek tari true zali pahje tar chalel nahi tar nahi at least one  
        if (existingUser) {
        return res.status(409).json({ message: 'User already exists' })
        }

        
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser =  await  UserModel.create({
      username,
      email,
      password: hashedPassword,
      fullName:{
        firstName,lastName
      }
    })
     const token = jwt.sign({
       id: newUser._id,
       username:newUser.username,
       email:newUser.email,
        role:newUser.role

     },process.env.JWT_SECRET)
     res.cookie('token',token,{
        httpOnly:true,
        secure:true,// client side   javascript hae wo ab cookie ko access kabhi kar nahi sakti jo sirf apka server hae sirf wahi cookie ke data acces kar sakt ahae clear bhi  
        maxAge:24*60*60*1000 // 1 day  ekdin tak data cookie data hoga  
     })


   
    res.status(201).json({ user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
    }})
  } catch (error) {
    console.error('Error during registration:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}   


const login = async(req,res )=>{
    try{
        const { username,email ,password} = req.body
                // syntax is {$or :[{field1:value1},{field2:value2}]}
        const user = await  UserModel.findOne({$or:[{username},{email}]}).select('+password') //  select karne ke liye password ko
        if(!user){
            return res.status(401).json({message:'Invaild Credentials '})
        }
        const isPasswordValid = await bcrypt.compare(password,user.password) // await importan hae agar await koi nahi hoga to wo promise return karega agar user ka password aglat bhi huva to wo true return karega ans user without correct password login kar pahega
        if(!isPasswordValid){
            return res.status(401).json({message:'Invaild Credentials'})
        }
        const token = jwt.sign({
            id: user._id,
            username:user.username,
            email:user.email,
             role:user.role
 
          },process.env.JWT_SECRET)

          res.cookie('token',token,{
             httpOnly:true,
             secure:true,// client side   javascript hae wo ab cookie ko access kabhi kar nahi sakti jo sirf apka server hae sirf wahi cookie ke data acces kar sakt ahae clear bhi  
             maxAge:24*60*60*1000 // 1 day  ekdin tak data cookie data hoga  
          })
          res.status(200).json({user:{
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          }})
    }catch(error){
        console.log('Error during login:', error)
    res.status(500).json({ message: 'Internal server error' })

    }
}


const getcurrentuser = async(req,res) =>{
    res.status(200).json({
        message:"Current user fetched successfully",
        user:req.user
    })

}

const logoutUser = async(req,res) =>{
try{
  const token = req.cookies.token
  if(token){
    await redis.set(`blacklist:${token}`,'true','EX',24*60*60) // 24*60*60 one day  
    // agar use ne token save kar diya and fir logout kar diya  and save kiya token use fir extenstion ki help dal diya to wo firse chalega 
    // to isliye hame token redis se blacklist kar diya 
    // redis ka token ek din ke baad expire kyu koi koi hame set kiya hae wese ham token expire karne 1 din me 
  }
  if(!token){
    return res.status(400).json({message:'No token found'})
  }
  res.clearCookie('token',{
    httpOnly:true,
    secure:true
  })
  res.status(200).json({message:'Logged out successfully'})

}
catch(error){
    console.log('Error during logout:', error)
    res.status(500).json({ message: 'Internal server error' }) 
}

}

const getAddresses = async (req, res) => {
  try{
    const id = req.user.id
    const user = await UserModel.findById(id)
    if(!user){
      return res.status(404).json({message:'User not found'})
    }

    res.status(200).json({
      message:'Addresses fetched successfully',
      addresses:user.addresses || []}) // agar user ke paas koi address nahi hae to empty array return kar dena

  }catch(error){
    console.error('Error fetching addresses:', error)
    res.status(500).json({ message: 'Internal server error' })
  }

}

const addAddress= async (req, res) => {

  try{
    const id = req.user.id
    const user = await UserModel.findById(id)
    if(!user){
      return res.status(404).json({message:'User not found'})
    }
    const {street,city,state,country,zip,phone} = req.body
    const newAddress = {
      street,city,state,country,zip,phone
    }
    // If this is the first address, set it as default
    if(user.addresses.length === 0){
      newAddress.isDefault = true
    }
    user.addresses.push(newAddress)
    await user.save()
    res.status(201).json({
      message:'Address added successfully',
      address:newAddress
    })  

  }catch(error){
    console.error('Error adding address:', error)
    res.status(500).json({ message: 'Internal server error' })
  }

}
const deleteAddress= async (req, res) =>{
 try{
  const id = req.user.id
  const { addressId } = req.params


  
  const user = await  UserModel.findOneAndUpdate({_id:id}, //1. Filter: find the user with this ID
    {$pull:{addresses:{_id:addressId}}},  // 2. Update: remove an address from the addresses array
    {new:true} // 3. Options: return the updated document instead of the old one  // updated document return karne ke liye 
    )
  if(!user){
    return res.status(404).json({message:'User not found'})
  }
  res.status(200).json({
    message:'Address deleted successfully',
    addresses:user.addresses
  })
 


 }catch(err){
  console.log(err)
    res.status(500).json({
      message:'Internal server error '
    })
 }

}


module.exports = {register,login,getcurrentuser,logoutUser,getAddresses,addAddress,deleteAddress  }