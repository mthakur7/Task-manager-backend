
const jwt=require("jsonwebtoken")
const User=require("../models/users")

const auth =async(req,res,next)=>{
    try{
const token=req.cookies.jwt;
const verifyUser=jwt.verify(token,process.env.SECRET_KEY);
const rootUser= await User.findOne({_id:verifyUser._id,"tokens.token":token})

if(!rootUser){throw new Error("user not found")};
req.token=token;
req.rootUser=rootUser;
req.userID=rootUser._id;

next();

    }
    catch(err){
        res.status(401).send("unauthorized: No token present");
        console.log(err);
    }
}
module.exports=auth;