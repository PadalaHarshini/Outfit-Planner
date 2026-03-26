import express from "express"
import User from "../modules/User-model.js"
import jwt from "jsonwebtoken"

const router = express.Router()

// REGISTER
router.post("/register", async(req,res)=>{

try{

const { name, email, password } = req.body

if(!name || !email || !password){
return res.status(400).json({message:"Name, email, and password are required"})
}

const existingUser = await User.findOne({email})

if(existingUser){
return res.status(409).json({message:"Email already registered"})
}

const user = new User(req.body)

await user.save()

res.json({message:"User registered successfully"})

}

catch(err){

res.status(500).json(err)

}

})


// LOGIN
router.post("/login", async(req,res)=>{

try{

const { email, password } = req.body

if(!email || !password){
return res.status(400).json({message:"Email and password are required"})
}

const user = await User.findOne({email:req.body.email})

if(!user){
return res.status(404).json({message:"User not found"})
}

if(user.password !== req.body.password){
return res.status(400).json({message:"Wrong password"})
}

const token = jwt.sign(
{id:user._id},
process.env.JWT_SECRET
)

res.json({
message:"Login successful",
token,
user:{
name:user.name,
email:user.email
}
})

}

catch(err){

res.status(500).json(err)

}

})

export default router
