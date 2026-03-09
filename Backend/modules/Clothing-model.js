import mongoose from "mongoose"

const clothingSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

type:{
type:String
},

color:{
type:String
},

season:{
type:String
}

},{timestamps:true})

export default mongoose.model("Clothing",clothingSchema)