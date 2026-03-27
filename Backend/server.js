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

// ✅ CORS (allow frontend)
app.use(cors({
  origin: "*",   // for now (later you can restrict to your Vercel URL)
}))

app.use(express.json())

// ✅ Serve images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// ✅ Routes
app.use("/api/auth", authRoutes)
app.use("/api/clothes", clothesRoutes)
app.use("/api/outfits", outfitRoutes)

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// ✅ Root test route (VERY IMPORTANT)
app.get("/", (req,res)=>{
  res.send("Backend is running 🚀")
})

// ✅ PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})
