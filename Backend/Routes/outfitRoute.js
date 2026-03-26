import express from "express"
import multer from "multer"
import Outfit from "../modules/Outfit-model.js"

const router = express.Router()

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

// GET ALL OUTFITS
router.get("/", async(req,res)=>{

try{

const outfits = await Outfit.find().sort({createdAt:-1})

res.json(outfits)

}

catch(err){

res.status(500).json(err)

}

})

// ADD OUTFIT WITH IMAGE
router.post("/add", upload.single("image"), async(req,res)=>{

try{

const outfit = new Outfit({

bodyType:req.body.bodyType,
occasion:req.body.occasion,
top:req.body.top,
bottom:req.body.bottom,
footwear:req.body.footwear,
image:req.file.filename

})

await outfit.save()

res.json({message:"Outfit added successfully"})

}

catch(err){

res.status(500).json(err)

}

})

// RECOMMEND OUTFITS
router.get("/recommend", async (req,res)=>{

try{

const { bodyType, occasion } = req.query

const outfits = await Outfit.find({
bodyType: bodyType,
occasion: occasion
})

res.json(outfits)

}

catch(err){

res.status(500).json(err)

}

})

export default router
