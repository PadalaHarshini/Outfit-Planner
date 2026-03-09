import express from "express"
import Clothing from "../modules/Clothing-model.js"

const router = express.Router()

// ADD CLOTHING
router.post("/add", async(req,res)=>{

try{

const cloth = new Clothing(req.body)

await cloth.save()

res.json({message:"Clothing added",cloth})

}

catch(err){

res.status(500).json(err)

}

})


// GET ALL CLOTHES
router.get("/all", async(req,res)=>{

try{

const clothes = await Clothing.find()

res.json(clothes)

}

catch(err){

res.status(500).json(err)

}

})

export default router