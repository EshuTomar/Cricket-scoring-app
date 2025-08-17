import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { createClient } from "redis"
import cors from "cors"
import matchRoutes from "./routes/matches"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/matches", matchRoutes)

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cricket-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Redis connection
const createRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  })

  try {
    await client.connect()
    console.log("Connected to Redis")
    return client
  } catch (err) {
    console.error("Redis connection error:", err)
    return null
  }
}

let redisClient: any = null

createRedisClient().then((client) => {
  redisClient = client
  // Make redis available globally
  global.redisClient = client
})

// Make io available globally
declare global {
  var io: Server
  var redisClient: any
}

global.io = io

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-match", (matchId) => {
    socket.join(`match-${matchId}`)
    console.log(`User ${socket.id} joined match ${matchId}`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
