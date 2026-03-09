import mongoose from "mongoose"

const outfitSchema = new mongoose.Schema({

bodyType:{
type:String,
required:true
},

occasion:{
type:String,
required:true
},

top:{
type:String
},

bottom:{
type:String
},

footwear:{
type:String
},

image:{
type:String
},

description:{
type:String
}

},{timestamps:true})

export default mongoose.model("Outfit",outfitSchema)