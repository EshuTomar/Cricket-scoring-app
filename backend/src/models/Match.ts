import mongoose, { type Document, Schema } from "mongoose"

export interface ICommentary {
  over: number
  ball: number
  eventType: string
  description: string
  runs: number
  timestamp: Date
}

export interface IMatch extends Document {
  matchId: number
  team1: string
  team2: string
  status: "ongoing" | "completed"
  currentScore: {
    runs: number
    wickets: number
    overs: number
    balls: number
  }
  commentary: ICommentary[]
  createdAt: Date
}

const CommentarySchema = new Schema<ICommentary>({
  over: { type: Number, required: true },
  ball: { type: Number, required: true },
  eventType: { type: String, required: true },
  description: { type: String, required: true },
  runs: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
})

const MatchSchema = new Schema<IMatch>({
  matchId: { type: Number, required: true, unique: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
  currentScore: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
  },
  commentary: [CommentarySchema],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IMatch>("Match", MatchSchema)
