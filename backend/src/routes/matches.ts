import express from "express"
import Match from "../models/Match"
import Counter from "../models/Counter"

const router = express.Router()

// Get next match ID
async function getNextMatchId(): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { name: "matchId" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  )
  return counter.value
}

// Start a new match
router.post("/start", async (req, res) => {
  try {
    const { team1, team2 } = req.body

    if (!team1 || !team2) {
      return res.status(400).json({ error: "Both teams are required" })
    }

    const matchId = await getNextMatchId()

    const match = new Match({
      matchId,
      team1,
      team2,
      status: "ongoing",
      currentScore: {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
      },
      commentary: [],
    })

    await match.save()

    // Cache in Redis if available
    if (global.redisClient) {
      try {
        await global.redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match))
      } catch (err) {
        console.error("Redis cache error:", err)
      }
    }

    res.status(201).json(match)
  } catch (error) {
    console.error("Error starting match:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Add commentary
router.post("/:id/commentary", async (req, res) => {
  try {
    const matchId = Number.parseInt(req.params.id)
    const { over, ball, eventType, description, runs = 0 } = req.body

    if (!over || !ball || !eventType || !description) {
      return res.status(400).json({ error: "All commentary fields are required" })
    }

    const match = await Match.findOne({ matchId })
    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    const commentary = {
      over,
      ball,
      eventType,
      description,
      runs,
      timestamp: new Date(),
    }

    match.commentary.push(commentary)

    // Update current score
    match.currentScore.runs += runs
    if (eventType === "wicket") {
      match.currentScore.wickets += 1
    }

    // Update overs and balls
    match.currentScore.balls += 1
    if (match.currentScore.balls === 6) {
      match.currentScore.overs += 1
      match.currentScore.balls = 0
    }

    await match.save()

    // Update Redis cache if available
    if (global.redisClient) {
      try {
        await global.redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match))
      } catch (err) {
        console.error("Redis cache error:", err)
      }
    }

    // Emit real-time update
    if (global.io) {
      global.io.to(`match-${matchId}`).emit("commentary-update", {
        matchId,
        commentary,
        currentScore: match.currentScore,
      })
    }

    res.status(201).json(commentary)
  } catch (error) {
    console.error("Error adding commentary:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get match details
router.get("/:id", async (req, res) => {
  try {
    const matchId = Number.parseInt(req.params.id)

    // Try Redis first if available
    if (global.redisClient) {
      try {
        const cached = await global.redisClient.get(`match:${matchId}`)
        if (cached) {
          return res.json(JSON.parse(cached))
        }
      } catch (err) {
        console.error("Redis get error:", err)
      }
    }

    const match = await Match.findOne({ matchId })
    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    // Cache in Redis if available
    if (global.redisClient) {
      try {
        await global.redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match))
      } catch (err) {
        console.error("Redis cache error:", err)
      }
    }

    res.json(match)
  } catch (error) {
    console.error("Error getting match:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all matches
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 })
    res.json(matches)
  } catch (error) {
    console.error("Error getting matches:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
