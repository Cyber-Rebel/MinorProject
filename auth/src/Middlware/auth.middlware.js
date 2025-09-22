const UserModel = require("../Models/user.models.js");
const jwt = require("jsonwebtoken");

const authmiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized No Token" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid Token" });
    }
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User Not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = authmiddleware;





































// {
//       // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       // console.log("Decoded Token:", decoded);  //Decoded Token: {id: '68c820e64756a3bf0aea3ae2',username: 'Ram@ram',  email: 'Ram@ram.com',  role: 'user',iat: 1757946098}
//       // // AGAR DECODE GALTA HAE TO VALUE ME KUCH NAHI ATA HAE 
//       // if (!decoded) {
//       //   return res.status(401).json({ message: "Unauthorized Invalid Token" });
//       // }
// }