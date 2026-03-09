import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"


import authRoutes from "./Routes/Auth-Route.js"
import clothesRoutes from "./Routes/clothesRoute.js"
import outfitRoutes from "./Routes/outfitRoute.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
// app.use("/uploads", express.static("uploads"))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// routes
app.use("/api/auth", authRoutes)
app.use("/api/clothes", clothesRoutes)
app.use("/api/outfits", outfitRoutes)


// database
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// server
app.listen(process.env.PORT,()=>{
console.log("Server running on port",process.env.PORT)
})